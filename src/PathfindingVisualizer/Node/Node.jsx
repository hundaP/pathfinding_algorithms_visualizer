import React, { Component } from "react";
import "./Node.css";

export default class Node extends Component {
  render() {
    const { col, row, isEnd, isStart, isWall, gridId, length } = this.props;
    const extraClassName = isEnd
      ? "node-end"
      : isStart
        ? "node-start"
        : isWall
          ? "node-wall"
          : "";

      
    return (
      <div
        id={`grid${gridId}-node-${row}-${col}`}
        className={[
          length > 51 ? "node-sm" : "node",
          extraClassName,
        ].join(" ")}
      ></div>
    );
  }
}