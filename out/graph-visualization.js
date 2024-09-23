"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphVisualization = void 0;
const vscode = require("vscode");
class GraphVisualization {
    constructor(context) {
        this.context = context;
    }
    show(data) {
        if (this.panel) {
            this.panel.reveal();
        }
        else {
            this.panel = vscode.window.createWebviewPanel('importExportGraph', 'Import/Export Graph', vscode.ViewColumn.Beside, {
                enableScripts: true,
                retainContextWhenHidden: true
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
        this.panel.webview.html = this.getWebviewContent(data);
    }
    getWebviewContent(data) {
        const d3Uri = this.panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'node_modules', 'd3', 'dist', 'd3.min.js'));
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Import/Export Graph</title>
                <script src="${d3Uri}"></script>
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                    #graph { width: 100vw; height: 100vh; }
                </style>
            </head>
            <body>
                <div id="graph"></div>
                <script>
                    const data = ${JSON.stringify(data)};
                    
                    // D3.js code to create the graph visualization
                    const svg = d3.select('#graph')
                        .append('svg')
                        .attr('width', '100%')
                        .attr('height', '100%');

                    const simulation = d3.forceSimulation(data.nodes)
                        .force('link', d3.forceLink(data.links).id(d => d.id))
                        .force('charge', d3.forceManyBody())
                        .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));

                    const link = svg.append('g')
                        .selectAll('line')
                        .data(data.links)
                        .enter().append('line')
                        .attr('stroke', '#999')
                        .attr('stroke-opacity', 0.6);

                    const node = svg.append('g')
                        .selectAll('circle')
                        .data(data.nodes)
                        .enter().append('circle')
                        .attr('r', 5)
                        .attr('fill', d => d.type === 'file' ? '#69b3a2' : '#404080');

                    node.append('title')
                        .text(d => d.id);

                    simulation.on('tick', () => {
                        link
                            .attr('x1', d => d.source.x)
                            .attr('y1', d => d.source.y)
                            .attr('x2', d => d.target.x)
                            .attr('y2', d => d.target.y);

                        node
                            .attr('cx', d => d.x)
                            .attr('cy', d => d.y);
                    });

                    // Add zoom functionality
                    const zoom = d3.zoom()
                        .on('zoom', (event) => {
                            svg.attr('transform', event.transform);
                        });

                    svg.call(zoom);
                </script>
            </body>
            </html>
        `;
    }
}
exports.GraphVisualization = GraphVisualization;
//# sourceMappingURL=graph-visualization.js.map