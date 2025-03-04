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
          { id: 'Node1', online: false, faulty: false },
          { id: 'Node2', online: false, faulty: false },
          { id: 'Node3', online: false, faulty: false },
          { id: 'Node4', online: false, faulty: false },
          { id: 'Node5', online: false, faulty: false },
          { id: 'Node6', online: false, faulty: false },
          { id: 'Node7', online: false, faulty: false },
          { id: 'Node8', online: false, faulty: false },
          { id: 'Node9', online: false, faulty: false },
          { id: 'Node10', online: false, faulty: false },
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

    updateNodeStatus(nodeId, online, faulty) {
        const nodeIndex = this.nodes.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
          this.nodes[nodeIndex].online = online;
          this.nodes[nodeIndex].faulty = faulty;
          this.saveNodes();
          this.notify();
        }
      }
    
      updateAllNodeStatuses(online, faulty) {
        this.nodes = this.nodes.map(node => ({
          ...node,
          online: online,
          faulty: faulty
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
        Node1: { x: 50, y: 250 },
        Node2: { x: 330, y: 50 },
        Node3: { x: 50, y: 500 },
        Node4: { x: 330, y: 300 },
        Node5: { x: 330, y: 550 },
        Node6: { x: 600, y: 200 },
        Node7: { x: 700, y: 430 },
        Node8: { x: 950, y: 50 },
        Node9: { x: 950, y: 300 },
        Node10: { x: 950, y: 550 },
      };
    }
}

export default NodeStatusService;
