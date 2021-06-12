import React from "react";

import { cn as useClassName } from "@bem-react/classname";
import Menu from "antd/es/menu";

import "./MenuList.scss";

const MenuList = (props) => {
  const { menu, onCloseMenu } = props;
  const cn = useClassName("menu-list");

  return (
    <Menu className={cn()} selectable={false}>
      {menu.map((item, index) => {
        return (
          <Menu.Item
            key={index}
            className={cn("item")}
            onClick={() => {
              item.callback && item.callback();
              onCloseMenu && onCloseMenu();
            }}
          >
            {item.text}
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default MenuList;
