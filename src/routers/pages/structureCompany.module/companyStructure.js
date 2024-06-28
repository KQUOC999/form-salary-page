import React, { useEffect, useRef } from 'react';
import TreeView from 'react-treeview';
import { fetchData } from './fetchData.module';
import { useAppContext } from './appContext.module';
import emitter from './eventEmitter.module';

const CompanyStructure = ({ user }) => {
  const { selectedNode, setSelectedNode, setDataByType, dataTreeCompany, setDataTreeCompany, setParentNode, setChildNodes } = useAppContext();
  const previousCompanyData = useRef([]);

  useEffect(() => {
    fetchData(user, setDataTreeCompany, setDataByType);

    const handleUpdateCompanyStructure = () => {
      fetchData(user, setDataTreeCompany, setDataByType);
    };

    emitter.on('updateCompanyStructure', handleUpdateCompanyStructure);

    return () => {
      emitter.off('updateCompanyStructure', handleUpdateCompanyStructure);
    };
  }, [user, setDataByType, setDataTreeCompany]);

  useEffect(() => {
    previousCompanyData.current = dataTreeCompany;
  }, [dataTreeCompany]);

  const findParentAndChildNodes = (tree, targetNodeId) => {
    let parentNode = null;
    let childNodes = [];
  
    const traverseTree = (nodes, parent = null) => {
      for (const node of nodes) {
        if (node.id === targetNodeId) {
          parentNode = parent;
          childNodes = node.children ? node.children.map(child => ({ label: child.label, id: child.id })) : [];
          return true;
        }
        if (node.children) {
          if (traverseTree(node.children, node)) {
            return true;
          }
        }
      }
      return false;
    };
  
    traverseTree(tree);
    return { parentNode, childNodes };
  };
  

  const handleNodeClick = (node) => {
    const nodeInfo = {
      lable: node.label,
      id: node.id
    };
  
    const { parentNode, childNodes } = findParentAndChildNodes(dataTreeCompany, node.id);
  
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
      setParentNode(null);
      setChildNodes([]);
    } else {
      setSelectedNode(nodeInfo);
      setParentNode({
        nodeInfo,
        parentNode: parentNode ? { label: parentNode.label, id: parentNode.id } : null,
        childNodes
      });
      setChildNodes(childNodes)
    }
  };
  

  const renderTree = (node) => (
    <TreeView
      key={node.id}
      nodeLabel={
        <span
          onClick={() => handleNodeClick(node)}
          style={{ color: selectedNode && selectedNode.id === node.id ? 'blue' : 'black', cursor: 'pointer' }}
        >
          {node.label}
        </span>
      }
      defaultCollapsed={false}
    >
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
