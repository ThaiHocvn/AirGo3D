import React from "react";
import Table, { ColumnsType } from "antd/es/table";
import type { TableProps } from "antd/es/table";

type DatatableProps<T> = {
  columns: ColumnsType<T>;
  data: T[];
} & Pick<TableProps<T>, "loading" | "pagination" | "onChange">;

function Datatable<T>({
  columns,
  data,
  loading,
  pagination,
  onChange,
}: DatatableProps<T>) {
  return (
    <Table<T>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={pagination ?? { pageSize: 6 }}
      onChange={onChange}
      size="middle"
    />
  );
}

export default Datatable;
