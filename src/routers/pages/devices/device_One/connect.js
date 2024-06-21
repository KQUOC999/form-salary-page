import React from 'react';
import TreeView from 'react-treeview';
import 'react-treeview/react-treeview.css';

const data = [
  {
    label: 'Nhân viên mới',
    children: [
      {
        label: 'Tên công ty',
        children: [
          {
            label: 'Khu vực',
            children: [
              { label: 'Tên phòng ban', children: [{ label: 'Tên chức vụ' }] }
            ]
          }
        ]
      }
    ]
  },
  {
    label: 'Nghỉ việc'
  }
];

const TreeViewComponent = () => {
  const renderTree = (node) => (
    <TreeView key={node.label} nodeLabel={node.label} defaultCollapsed={false}>
      {node.children && node.children.map(child => renderTree(child))}
    </TreeView>
  );

  return (
    <div>
      {data.map(node => renderTree(node))}
    </div>
  );
};

export default TreeViewComponent;