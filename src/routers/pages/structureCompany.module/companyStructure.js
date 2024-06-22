import React, { useState, useEffect } from 'react';
import TreeView from 'react-treeview';
import { fetchData } from './fetchData.module';
import emitter from './eventEmitter.module'

const CompanyStructure = ({ user }) => {
  const [dataTreeCompany, setDataTreeCompany] = useState([]);

  useEffect(() => {
    fetchData(user, setDataTreeCompany);

    emitter.on('updateCompanyStructure', () => {
      fetchData(user, setDataTreeCompany);
    });

    return () => {
        emitter.off('updateCompanyStructure');
    }

  }, [user]); // Thêm user vào dependency để useEffect gọi lại khi user thay đổi

  const renderTree = (node) => (
    <TreeView key={node.label} nodeLabel={node.label} defaultCollapsed={false}>
      {node.children && node.children.map(child => renderTree(child))}
    </TreeView>
  );
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        {dataTreeCompany.map(node => renderTree(node))}
      </div>
    </div>
  );
};

export default CompanyStructure;
