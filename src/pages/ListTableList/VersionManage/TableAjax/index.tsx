import React from "react";
import styles from "./index.less";
import {Divider, Table} from "antd";
import reqwest from "reqwest";

const columns = [
  {
    title: "地图版本号",
    dataIndex: "mapVersionId",
  //  key: "mapVersion",
    sorter: true,
    //render: text => <a>{text}</a>
  },
  {
    title: "地图文件目录",
    dataIndex: "mapFilePath",
  //  key: "mapDirectory"
  },
  {
    title: "地图文件名",
    dataIndex: "mapFileName",
  //  key: "address"
  },
  {
    title: "地图文件大小",
 //   key: "mapSize",
    dataIndex: "mapFileSize"
  },
  {
    title: "清单文件目录",
    dataIndex: "manifestFilePath",
    //  key: "manifestFilePath"
  },
  {
    title: "清单文件名",
    dataIndex: "manifestFileName",
  },
  {
    title: "清单文件大小",
    //   key: "manifestFileSize",
    dataIndex: "manifestFileSize"
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
    key: "mapStatus",
    dataIndex: "mapStatus",
    hideInForm: true,
    valueEnum: {
      2: { text: '已下线', status: 'OffLine' },
      1: { text: '灰度发布中', status: 'GrayRelease' },
      0: { text: '已上线', status: 'Success' },
    },
  },

  {
    title: "操作",
  //  key: "action",
    render: (text, record) => (
      <>
        <a
          onClick={() => {
            // handleUpdateModalVisible(true);
            // setStepFormValues(record);
          }}
        >
          编辑
        </a>
        <Divider type="vertical" />
        <a href="">删除</a>

        <Divider type="vertical" />
        <a href="">发布</a>

        <Divider type="vertical" />
        <a href="">下线</a>
      </>
    )
  }
];

class App extends React.Component {
  state = {
    data: [],
    pagination: {},
    loading: false
  };

  componentDidMount() {
    this.fetch();
  }

  handleDelete = key => {
    const dataSource = [...this.state.data];
    this.setState({ data: dataSource.filter(item => item.key !== key) });
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
        data: data.data,
        pagination
      });
    });
  };

  render() {
    return (
      <Table
        columns={columns}
       // rowKey={record => record.login.uuid}
        dataSource={this.state.data}
        pagination={this.state.pagination}
        loading={this.state.loading}
        onChange={this.handleTableChange}
      />
    );
  }
}

export default () => (
  <div className={styles.container}>
    <div id="components-table-demo-ajax">
      <App />
    </div>
  </div>
);
