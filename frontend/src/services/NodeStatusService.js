class NodeStatusService {
    constructor() {
      if (NodeStatusService.instance) {
        return NodeStatusService.instance;
      }

      // Próba załadowania zapisanych danych z localStorage
      const savedNodes = localStorage.getItem('nodes');
      if (savedNodes) {
        this.nodes = JSON.parse(savedNodes);
      } else {
        // Jeśli brak zapisanych danych, inicjalizujemy domyślnie
        this.nodes = [
          { id: 'Node1', online: false },
          { id: 'Node2', online: false },
          { id: 'Node3', online: false },
          { id: 'Node4', online: false },
          { id: 'Node5', online: false },
          { id: 'Node6', online: false },
          { id: 'Node7', online: false },
          { id: 'Node8', online: false },
          { id: 'Node9', online: false },
          { id: 'Node10', online: false },
        ];
      }

      this.listeners = [];
      NodeStatusService.instance = this;
    }

    static getInstance() {
      return new NodeStatusService();
    }

    subscribe(listener) {
      this.listeners.push(listener);
    }

    unsubscribe(listener) {
      this.listeners = this.listeners.filter(l => l !== listener);
    }

    notify() {
      this.listeners.forEach(listener => listener());
    }

    updateNodeStatus(nodeId, status) {
        const nodeIndex = this.nodes.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
          this.nodes[nodeIndex].online = status;
          this.saveNodes();
          this.notify();
        }
      }
    
      updateAllNodeStatuses(status) {
        this.nodes = this.nodes.map(node => ({
          ...node,
          online: status,
        }));
        this.saveNodes();
        this.notify();
      }

    saveNodes() {
      localStorage.setItem('nodes', JSON.stringify(this.nodes));
    }

    getNodes() {
      return this.nodes;
    }

    getDefaultPositions() {
      return {
        Node1: { x: 15, y: 100 },
        Node2: { x: 215, y: 50 },
        Node3: { x: 215, y: 250 },
        Node4: { x: 415, y: 50 },
        Node5: { x: 415, y: 250 },
        Node6: { x: 615, y: 150 },
        Node7: { x: 815, y: 250 },
        Node8: { x: 1015, y: 50 },
        Node9: { x: 1015, y: 250 },
        Node10: { x: 1215, y: 250 },
      };
    }
}

export default NodeStatusService;
