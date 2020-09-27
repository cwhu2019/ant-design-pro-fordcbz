import React from "react";
import styles from "./index.less";
import { Input } from "antd";

const { Search } = Input;

export default () => (
  <div className={styles.container}>
    <div id="components-input-demo-search-input">
      <div>
        <Search
          placeholder="input search text"
          onSearch={value => console.log(value)}
          enterButton
          style={{ width: 300 }}
        />
        <br />
        <br />
      </div>
    </div>
  </div>
);
