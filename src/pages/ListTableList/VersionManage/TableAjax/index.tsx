import React, { useContext, useState, useEffect, useRef }from "react";
import styles from "./index.less";
import {Divider, Table, Input, Button, Popconfirm, Form, message, Tooltip  } from "antd";
import reqwest from "reqwest";

import { Resizable } from 'react-resizable';

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

const ResizableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

class MapVersionTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      pagination: {},
      loading: false,
      editingKey: '',
      count: 0
    };
    this.columns = [
      {
        title: "地图版本号",
        dataIndex: "mapVersionId",
        //  key: "mapVersion",
        sorter: true,
        editable: true,
        width: '10%',
        ellipsis: true,
        render: mapVersionId => (
          <Tooltip placement="topLeft" title={mapVersionId}>
            {mapVersionId}
          </Tooltip>
        ),
        //render: text => <a>{text}</a>
      },
      {
        title: "地图文件目录",
        dataIndex: "mapFilePath",
        editable: true,
        width: '10%',
        ellipsis: true,
        render: mapFilePath => (
          <Tooltip placement="topLeft" title={mapFilePath}>
            {mapFilePath}
          </Tooltip>
        ),
        //  key: "mapDirectory"
      },
      {
        title: "地图文件名",
        dataIndex: "mapFileName",
        editable: true,
        width: '10%',
        ellipsis: true,
        render: mapFileName => (
          <Tooltip placement="topLeft" title={mapFileName}>
            {mapFileName}
          </Tooltip>
        ),
        //  key: "address"
      },
      {
        title: "地图文件大小",
        //   key: "mapSize",
        dataIndex: "mapFileSize",
        width: '5%',
        editable: true,
        ellipsis: true,
      },
      {
        title: "清单文件目录",
        dataIndex: "manifestFilePath",
        editable: true,
        width: '10%',
        ellipsis: true,
        render: manifestFilePath => (
          <Tooltip placement="topLeft" title={manifestFilePath}>
            {manifestFilePath}
          </Tooltip>
        ),
        //  key: "manifestFilePath"
      },
      {
        title: "清单文件名",
        dataIndex: "manifestFileName",
        editable: true,
        width: '10%',
        ellipsis: true,
        render: manifestFileName => (
          <Tooltip placement="topLeft" title={manifestFileName}>
            {manifestFileName}
          </Tooltip>
        ),
      },
      {
        title: "清单文件大小",
        //   key: "manifestFileSize",
        dataIndex: "manifestFileSize",
        editable: true,
        width: '5%',
        ellipsis: true,
      },
      {
        title: '上传时间',
        dataIndex: 'createdAt',
        sorter: true,
        valueType: 'dateTime',
        hideInForm: true,
        width: '10%',
        ellipsis: true,
        // renderText: (val: string) => `${val} 万`,
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        sorter: true,
        valueType: 'dateTime',
        hideInForm: true,
        width: '10%',
        ellipsis: true,
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
        width: '10%',
        ellipsis: true,
      },

      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          const {editingKey} = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                  {() => (
                    <button
                      onClick={() => this.handleSave(record)}
                      style={{marginRight: 8}}
                      type="button"
                    >
                      保存
                    </button>
                  )}
              </EditableContext.Consumer>
              <Popconfirm
                title="Sure to cancel?"
                onConfirm={() => this.cancel(record.key)}
              >
                  <button style={{marginRight: 8}} type="button">
                      取消
                  </button>
              </Popconfirm>
              <Popconfirm
                title="Sure to delete?"
                onConfirm={() => this.delete(record.mapVersionId)}
              >
                  <button type="button">删除</button>
              </Popconfirm>
            </span>
          ) : (
            <>
              <Divider type="vertical"/>
              {
                <a disabled={editingKey !== ''}
                   onClick={() => this.edit(record.mapVersionId)}
                >
                  编辑
                </a>
              }

            <Divider type = "vertical" />
            <a href = "" > 发布 </a>

            <Divider type = "vertical" / >
            <a href = "" > 下线 </a>
           </>
        );
       },
      },

      // {
      //   title: "操作",
      //   dataIndex: 'operation',
      //   render: (text, record) => (
      //     <>
      //       <Divider type="vertical"/>
      //       {
      //         const { editingKey } = this.state;
      //         const editable = this.isEditing(record);
      //         return editable ? (
      //         <span>
      //         <EditableContext.Consumer>
      //         {(form) => (
      //           <button
      //             onClick={() => this.save(form, record.key)}
      //             style={{ marginRight: 8 }}
      //             type="button"
      //           >
      //             Save
      //           </button>
      //         )}
      //         </EditableContext.Consumer>
      //         <Popconfirm
      //         title="Sure to cancel?"
      //         onConfirm={() => this.cancel(record.key)}
      //         >
      //         <button style={{ marginRight: 8 }} type="button">
      //         Cancel
      //         </button>
      //         </Popconfirm>
      //         <Popconfirm
      //         title="Sure to delete?"
      //         onConfirm={() => this.delete(record.key)}
      //         >
      //         <button type="button">delete</button>
      //         </Popconfirm>
      //         </span>
      //         ) : (
      //         <button
      //         type="button"
      //         disabled={editingKey !== ''}
      //         onClick={() => this.edit(record.key)}
      //         >
      //         Edit
      //         </button>
      //         );
      //       },
      //
      //
      //       <Divider type="vertical"/>
      //       {
      //         this.state.dataSource.length >= 1 ? (
      //           <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.mapVersionId)}>
      //             <a>删除</a>
      //           </Popconfirm>
      //         ) : null
      //       }
      //
      //       <Divider type="vertical"/>
      //       <a href="">发布</a>
      //
      //       <Divider type="vertical"/>
      //       <a href="">下线</a>
      //     </>
      //   )
      // }
    ];
  }


  componentDidMount() {
    this.fetch();
  }

  isEditing = (record) => {
    const { editingKey } = this.state;
    return record.mapVersionId === editingKey;
  };
  cancel = (key) => {
  //  // if (key.length > 6) {
  //   const dataSource = [...this.state.dataSource];
  //     const newData = dataSource;
  //     newData.splice(dataSource.length - 1, 1);
  //     this.setState({ dataSource: newData, editingKey: key });
  // //  }
    this.setState({ editingKey: '' });
  };

  delete = (key) => {
    const dataSource = [...this.state.dataSource];
    const newData = dataSource;
    const index = newData.findIndex((item) => key === item.mapVersionId);
    newData.splice(index, 1);
    this.setState({ dataSource: newData, editingKey: '' });
  };
  // save(form, key) {
  //   form.validateFields((error, row) => {
  //     if (error) {
  //       return;
  //     }
  //     const { dataSource } = this.state;
  //     const newData = [...dataSource];
  //     const index = newData.findIndex((item) => key === item.mapVerionId);
  //     if (index > -1) {
  //       const item = newData[index];
  //       newData.splice(index, 1, {
  //         ...item,
  //         ...row,
  //       });
  //       this.setState({ dataSource: newData, editingKey: '' });
  //     } else {
  //       newData.push(row);
  //       this.setState({ dataSource: newData, editingKey: '' });
  //     }
  //   });
  // }

  // handleDelete = key => {
  //   console.log("handleDelete, key:", key);
  //   const dataSource = [...this.state.dataSource];
  //   this.setState({ dataSource: dataSource.filter(item => item.mapVersionId !== key) });
  // };

  edit = (key) => {
    console.log("edit, key:", key);
    this.setState({ editingKey: key });
  };

  handleAdd = () => {
    const {count, dataSource, editingKey } = this.state;
    if (editingKey !== '') {
      message.error('请先保存');
      return;
    }
    const key = "v1";
    const time = new Date().toString();
    const newRecord = {
      mapVersionId: 'v1',
      mapFilePath: '',
      mapFileName: '',
      mapFileSize: 0,
      manifestFilePath: '',
      manifestFileName: '',
      manifestFileSize: 0,
      createdAt: time,
      updateAt: time,
    };
    // const newData = {
    //
    //   mapVersionId: "v1",
    //   key,
    //
    // };
    this.setState({
      dataSource: [...dataSource, newRecord],
      count: count + 1,
      editingKey: key,
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
    this.setState({
      dataSource: newData,
      editingKey: '',
    });
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

  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };


  render() {
    const { dataSource } = this.state;
    const { loading } = this.state;
    const components = {
      header: {
        cell: ResizableTitle,
      },
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col, index) => {
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
        onHeaderCell: column => ({
          width: column.width,
          onResize: this.handleResize(index),
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
