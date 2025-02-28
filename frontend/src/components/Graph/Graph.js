import React, { useEffect, useState } from 'react';
import logService from '../../services/LogService';
import './Graph.css';
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import NodeStatusService from '../../services/NodeStatusService';

const nodeTypes = {
  custom: CustomNode,
};

const initialEdges = [
  { id: 'e1-2', source: 'Node1', target: 'Node2' },
  { id: 'e1-3', source: 'Node1', target: 'Node3' },
  { id: 'e2-4', source: 'Node2', target: 'Node4' },
  { id: 'e3-5', source: 'Node3', target: 'Node5' },
  { id: 'e4-5', source: 'Node4', target: 'Node5' },
  { id: 'e5-6', source: 'Node5', target: 'Node6' },
  { id: 'e6-7', source: 'Node6', target: 'Node7' },
  { id: 'e8-7', source: 'Node8', target: 'Node7' },
  { id: 'e8-9', source: 'Node8', target: 'Node9' },
  { id: 'e9-10', source: 'Node9', target: 'Node10' },
  { id: 'e4-6', source: 'Node4', target: 'Node6' },
  { id: 'e5-7', source: 'Node5', target: 'Node7' },
  { id: 'e2-8', source: 'Node2', target: 'Node8' },
];

const Graph = () => {
  const nodeStatusService = NodeStatusService.getInstance();

  // Inicjalizowanie węzłów z NodeStatusService, uwzględniając zapisane pozycje
  const initialNodes = nodeStatusService.getNodes().map((node) => ({
    id: node.id,
    type: 'custom',
    position: nodeStatusService.getDefaultPositions()[node.id] || { x: 15, y: 100 }, // Używamy zapisanych pozycji
    data: { label: node.id, online: node.online },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const colorGraph = () => {
    const logs = logService.getLogs();
    if (!logs || logs.length === 0) return;

    logs.forEach((log) => {
      const currentNode = log.current_node;
      const nextNode = log.details?.target_node;
      const failedNode = log.details?.failed_node;

      setEdges((prevEdges) =>
        prevEdges.map((edge) => {
          if (log.status === "TRANSFER_SUCCESS" && edge.source === currentNode && edge.target === nextNode) {
            return {
              ...edge,
              style: { stroke: "#00FF00", strokeWidth: 2 },
              animated: true,
              markerEnd: { type: "arrowclosed", color: "#00FF00" },
            };
          }

          if (log.status === "CONNECTION_FAILED" && edge.source === currentNode && edge.target === failedNode) {
            return {
              ...edge,
              style: { stroke: "#FF0000", strokeWidth: 2 },
              animated: true,
              markerEnd: { type: "arrowclosed", color: "#FF0000" },
            };
          }

          return edge;
        })
      );
    });
  };

  // Nasłuchuj zmian statusu w węzłach
  useEffect(() => {
    const handleStatusChange = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const updatedNode = nodeStatusService.getNodes().find((n) => n.id === node.id);
          return updatedNode ? { ...node, data: { ...node.data, online: updatedNode.online } } : node;
        })
      );
    };

    nodeStatusService.subscribe(handleStatusChange);

    return () => {
      nodeStatusService.unsubscribe(handleStatusChange);
    };
  }, [nodeStatusService]);

  const resetGraph = () => {
    return new Promise((resolve) => {
      setEdges(initialEdges);
      resolve();
    });
  };

  useEffect(() => {
    const handleLogChange = () => {
      resetGraph().then(() => {
        colorGraph();
      });
    };

    logService.subscribe(handleLogChange);
    return () => logService.unsubscribe(handleLogChange);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} className="content_graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      />
    </div>
  );
};

export default Graph;
