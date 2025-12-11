import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import client from "../../config/apollo"; // import Apollo Client đã cấu hình
import { appendPanoramas } from "../../store/slices/panoramaSlice";
import { UPLOAD_PANORAMA } from "../queries";

export function useUploadPanorama() {
  const dispatch = useDispatch();

  const [uploadMutation, { loading, error }] = useMutation(UPLOAD_PANORAMA, {
    client,
  });

  const upload = async ({ file, name }: { file: File; name: string }) => {
    const result = await uploadMutation({
      variables: { file, name },
    });
    const uploaded = result.data.uploadPanorama;
    dispatch(appendPanoramas([uploaded]));
    return uploaded;
  };

  return { upload, loading, error };
}
