import {
  DeleteOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Switch,
  Tag,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { RcFile } from "antd/es/upload";
import Datatable from "components/ui/Datatable";
import { useDeletePanorama } from "graphql/hooks/useDeletePanorama";
import { useToggleBookmark } from "graphql/hooks/useToggleBookmark";
import { useUploadPanorama } from "graphql/hooks/useUploadPanorama";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PanoramaState } from "store/slices/panoramaSlice";
import { formatDate, formatFileSize, validateUploadImage } from "utils/utils";
import { usePanoramas } from "../../graphql/hooks/usePanoramas";
import PanoramaViewerModal from "./PanoramaViewerModal";
import { useDownloadPanorama } from "graphql/hooks/useDownloadPanorama";
import { RootState } from "store/store";

export default function PanoramaTable() {
  const { upload } = useUploadPanorama();
  const { toggle, loading: loadingToggle } = useToggleBookmark();
  const { deletePanorama, loading: loadingDelete } = useDeletePanorama();
  const { download } = useDownloadPanorama();

  const loading = useSelector((state: RootState) => state.panorama.loading);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<null | string>(null);
  const [modalPanorama, setModalPanorama] = useState(false);
  const [modalSrc, setModalSrc] = useState({ url: "", name: "" });

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(6);

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      400
    );
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, bookmarkedOnly]);

  const { panoramas, total, refetch } = usePanoramas({
    search: debouncedQuery,
    isBookmarked: bookmarkedOnly ? true : undefined,
    limit,
    offset: page * limit,
  });

  const handleUpdateBookmark = async (id: string, isBookmarked: boolean) => {
    try {
      await toggle(id);
      message.success(`Bookmark ${isBookmarked ? "removed" : "added"}`);
    } catch (error) {
      message.error("Failed to toggle bookmark");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePanorama(id);
      message.success("Panorama deleted successfully");
      refetch();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete panorama");
    }
  };

  const onViewPanorama = (record: any) => {
    setModalSrc({ url: record.previewPath, name: record.name });
    setModalPanorama(true);
  };

  const handleDownload = async (id: string, url: string, name: string) => {
    setDownloadingId(id);
    await download(url, name);
    setDownloadingId(null);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Preview",
      dataIndex: "thumbnailPath",
      responsive: ["xs", "sm", "md", "lg"],
      render: (thumbnailPath: string, record) =>
        thumbnailPath ? (
          <img
            src={thumbnailPath}
            alt={record.name}
            className="w-[80px] h-[50px] sm:w-[100px] sm:h-[60px] object-cover rounded-md cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => onViewPanorama(record)}
            data-testid="preview-img"
          />
        ) : (
          <div className="h-[60px] flex items-center justify-center bg-gray-100 text-gray-500 text-xs rounded-md">
            No Preview
          </div>
        ),
    },
    { title: "Name", dataIndex: "name", responsive: ["xs", "sm", "md", "lg"] },

    {
      title: "Size",
      dataIndex: "size",
      responsive: ["md"],
      render: (size: number) => <span>{formatFileSize(size)}</span>,
    },
    {
      title: "Type",
      dataIndex: "mimeType",
      responsive: ["lg"],
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      responsive: ["sm", "md", "lg"],
      render: (createdAt: Date) => <span>{formatDate(createdAt)}</span>,
    },
    {
      title: "Status",
      dataIndex: "isBookmarked",
      responsive: ["sm", "md", "lg"],
      render: (isBookmarked: boolean) => (
        <Tag color={isBookmarked ? "geekblue" : "default"}>
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Tag>
      ),
    },
    {
      title: "Action",
      responsive: ["xs", "sm", "md", "lg"],
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={record.isBookmarked ? <StarFilled /> : <StarOutlined />}
            onClick={() => handleUpdateBookmark(record.id, record.isBookmarked)}
            data-testid={`btn-bookmark-${record.id}`}
          />

          <Button
            type="link"
            icon={<DownloadOutlined />}
            loading={downloadingId === record.id}
            disabled={downloadingId === record.id}
            onClick={() =>
              handleDownload(record.id, record.previewPath, record.originalName)
            }
            data-testid={`btn-download-${record.id}`}
          />

          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            data-testid={`btn-delete-${record.id}`}
          />
        </Space>
      ),
    },
  ];

  const onTableChange = ({ current, pageSize }: any) => {
    if (current) setPage(current - 1);
    if (pageSize) setLimit(pageSize);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error("Please select a file");
      return;
    }

    try {
      setUploading(true);
      validateUploadImage(selectedFile);
      message.loading({ content: "Uploading...", key: "upload" });

      await upload({
        file: selectedFile,
        name: selectedFile.name,
      });

      message.success({
        content: "Upload successful!",
        key: "upload",
        duration: 2,
      });
      setSelectedFile(null);
      setPreviewUrl("");
      refetch();
    } catch (err: any) {
      console.error(err);
      message.error({
        content: err.message,
        key: "upload",
        duration: 2,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Row>
      <Col xs={24}>
        <Card title="Panorama images">
          <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input.Search
                placeholder="Search name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="max-w-[360px]"
                data-testid="search-input"
              />

              <div>
                <Switch
                  checked={bookmarkedOnly}
                  onChange={(v) => setBookmarkedOnly(v)}
                  checkedChildren="Bookmarked"
                  unCheckedChildren="Unbookmarked"
                  data-testid="bookmark-switch"
                />
              </div>
            </div>

            <Button
              type="primary"
              className="w-full sm:w-auto"
              onClick={() => setUploadModalVisible(true)}
              data-testid="open-upload-modal"
            >
              Upload image
            </Button>
          </div>

          <Modal
            title="Upload image"
            open={uploadModalVisible}
            onOk={handleUpload}
            onCancel={() => {
              setUploadModalVisible(false);
              setSelectedFile(null);
              setPreviewUrl("");
            }}
            okButtonProps={{
              "data-testid": "upload-submit",
              loading: uploading,
            }}
          >
            <Upload.Dragger
              beforeUpload={(file: RcFile) => {
                setSelectedFile(file);

                const url = URL.createObjectURL(file);

                setPreviewUrl(url);

                return false;
              }}
              multiple={false}
              showUploadList={false}
              accept="image/*"
            >
              <FolderOpenOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <p className="ant-upload-text">
                Drag & drop an image here, or click to select
              </p>
            </Upload.Dragger>

            {previewUrl && (
              <div className="mt-3 flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 260,
                    objectFit: "contain",
                    borderRadius: 8,
                    marginTop: 12,
                    border: "1px solid #eee",
                  }}
                />
                <div className="mt-2 text-center text-sm text-gray-500">
                  {selectedFile?.name}
                </div>
              </div>
            )}
          </Modal>

          {modalPanorama && (
            <PanoramaViewerModal
              open={modalPanorama}
              src={modalSrc}
              onClose={() => setModalPanorama(false)}
            />
          )}

          <div className="overflow-x-auto">
            <Datatable
              columns={columns}
              data={panoramas}
              loading={loading}
              pagination={{
                current: page + 1,
                pageSize: limit,
                total: total,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              onChange={onTableChange}
              data-testid="panorama-table"
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
}
