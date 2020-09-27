import React, { useContext, useState, useEffect, useRef }from "react";
import styles from "./index.less";
import {Divider, Table, Input, Button, Popconfirm, Form} from "antd";
import reqwest from "reqwest";

const EditableContext = React.createContext<any>();

interface Item {
  mapVersionId: string;
  mapFilePath: string;
  mapFileName: string;
  mapFileSize: string;
  manifestFilePath: string;
  manifestFileName: string;
  manifestFileSize: string;
  createdAt: Date;
  updateAt: Date;
  mapStatus: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                     title,
                                                     editable,
                                                     children,
                                                     dataIndex,
                                                     record,
                                                     handleSave,
                                                     ...restProps
                                                   }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef();
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async e => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

class MapVersionTable extends React.Component {

  constructor(props) {
    super(props);

    this.columns = [
      {
        title: "地图版本号",
        dataIndex: "mapVersionId",
        //  key: "mapVersion",
        sorter: true,
        editable: true,
        //render: text => <a>{text}</a>
      },
      {
        title: "地图文件目录",
        dataIndex: "mapFilePath",
        editable: true,
        //  key: "mapDirectory"
      },
      {
        title: "地图文件名",
        dataIndex: "mapFileName",
        editable: true,
        //  key: "address"
      },
      {
        title: "地图文件大小",
        //   key: "mapSize",
        dataIndex: "mapFileSize",
        editable: true,
      },
      {
        title: "清单文件目录",
        dataIndex: "manifestFilePath",
        editable: true,
        //  key: "manifestFilePath"
      },
      {
        title: "清单文件名",
        dataIndex: "manifestFileName",
        editable: true,
      },
      {
        title: "清单文件大小",
        //   key: "manifestFileSize",
        dataIndex: "manifestFileSize",
        editable: true,
      },
      {
        title: '上传时间',
        dataIndex: 'createdAt',
        sorter: true,
        valueType: 'dateTime',
        hideInForm: true,
        // renderText: (val: string) => `${val} 万`,
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        valueType: 'dateTime',
        hideInForm: true,
      },
      {
        title: "状态",
       // key: "mapStatus",
        dataIndex: "mapStatus",
        hideInForm: true,
        valueEnum: {
          2: {text: '已下线', status: 'OffLine'},
          1: {text: '灰度发布中', status: 'GrayRelease'},
          0: {text: '已上线', status: 'Success'},
        },
      },

      {
        title: "操作",
        dataIndex: 'operation',
        render: (text, record) => (
          <>

              const editable = isEditing(record);
              return editable ? (
              <span>
              <a
                href="javascript:;"
                onClick={() => save(record.key)}
                style={{
                marginRight: 8,
                }}
              >
                保存
              </a>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>取消</a>
              </Popconfirm>
              </span>
              ) : (
              <a disabled={editingKey !== ''} onClick={() => edit(record)}>
              编辑
              </a>
              );

            <Divider type="vertical"/>
            {
              this.state.dataSource.length >= 1 ? (
                <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.mapVersionId)}>
                  <a>删除</a>
                </Popconfirm>
              ) : null
            }

            <Divider type="vertical"/>
            <a href="">发布</a>

            <Divider type="vertical"/>
            <a href="">下线</a>
          </>
        )
      }
    ];

    this.state = {
      dataSource: [],
      pagination: {},
      loading: false,
      count: 0
    };
  }


  componentDidMount() {
    this.fetch();
  }

  handleDelete = key => {
    console.log("handleDelete, key:", key);
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item.mapVersionId !== key) });
  };

  handleAdd = () => {
    const {count, dataSource} = this.state;
    const newData = {

      mapVersionId: "v1",
      key: "v1",

    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };
  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.mapVersionId === item.mapVersionId);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.fetch({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters
    });
  };

  fetch = (params = {}) => {
    console.log("params:", params);
    this.setState({ loading: true });
    reqwest({
      url: "http://localhost:8080/management/maps",
      method: "get",
      // data: {
      //   results: 10,
      //   ...params
      // },
      type: "json",

    }).then(data => {
      console.log("data:", data.results);
      const pagination = { ...this.state.pagination };
      // Read total count from server
      // pagination.total = data.totalCount;
      pagination.total = 1;
      this.setState({
        loading: false,
        dataSource: data.data,
        count: data.data.length,
        pagination
      });
    });
  };

  render() {
    const { dataSource } = this.state;
    const { loading } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
          新增
        </Button>
        <Table
          components={components}

         // rowKey={record => record.login.uuid}
          rowKey={record => record.mapVersionId}
          columns={columns}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
         // pagination={this.state.pagination}
          loading={loading}
          //count={this.state.count}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default () => (
  <div className={styles.container}>
    <div id="components-table-ajax">
      <MapVersionTable />
    </div>
  </div>
);
