import * as vscode from "vscode";
import * as d3 from "d3";

export class GraphVisualization {
  private panel: vscode.WebviewPanel | undefined;

  constructor(private context: vscode.ExtensionContext) {}

  public show(data: any) {
    if (this.panel) {
      this.panel.reveal();
    } else {
      this.panel = vscode.window.createWebviewPanel(
        "importExportGraph",
        "Import/Export Graph",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }

    this.panel.webview.html = this.getWebviewContent(data);
  }

  private getWebviewContent(data: any): string {
    const d3Uri = this.panel!.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "node_modules",
        "d3",
        "dist",
        "d3.min.js"
      )
    );

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
                    .node text {
                        font: 12px sans-serif;
                    }
                    .node circle {
                        stroke: #fff;
                        stroke-width: 1.5px;
                    }
                    .link {
                        stroke: #999;
                        stroke-opacity: 0.6;
                    }
                </style>
            </head>
            <body>
                <div id="graph"></div>
                <script>
                    const data = ${JSON.stringify(data)};
                    
                    const width = window.innerWidth;
                    const height = window.innerHeight;

                    const svg = d3.select('#graph')
                        .append('svg')
                        .attr('width', width)
                        .attr('height', height);

                    const simulation = d3.forceSimulation(data.nodes)
                        .force('link', d3.forceLink(data.links).id(d => d.id))
                        .force('charge', d3.forceManyBody().strength(-300))
                        .force('center', d3.forceCenter(width / 2, height / 2));

                    const link = svg.append('g')
                        .attr('class', 'links')
                        .selectAll('line')
                        .data(data.links)
                        .enter().append('line')
                        .attr('class', 'link');

                    const node = svg.append('g')
                        .attr('class', 'nodes')
                        .selectAll('.node')
                        .data(data.nodes)
                        .enter().append('g')
                        .attr('class', 'node')
                        .call(d3.drag()
                            .on('start', dragstarted)
                            .on('drag', dragged)
                            .on('end', dragended));

                    node.append('circle')
                        .attr('r', 5)
                        .attr('fill', d => d.type === 'file' ? '#69b3a2' : d.type === 'export' ? '#404080' : '#ff7f0e');

                    node.append('text')
                        .attr('dy', -10)
                        .attr('text-anchor', 'middle')
                        .text(d => d.id.split('/').pop());

                    node.append('title')
                        .text(d => d.id);

                    simulation
                        .nodes(data.nodes)
                        .on('tick', ticked);

                    simulation.force('link')
                        .links(data.links);

                    function ticked() {
                        link
                            .attr('x1', d => d.source.x)
                            .attr('y1', d => d.source.y)
                            .attr('x2', d => d.target.x)
                            .attr('y2', d => d.target.y);

                        node
                            .attr('transform', d => \`translate(\${d.x},\${d.y})\`);
                    }

                    function dragstarted(event, d) {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }

                    function dragged(event, d) {
                        d.fx = event.x;
                        d.fy = event.y;
                    }

                    function dragended(event, d) {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    }

                    // Add zoom functionality
                    const zoom = d3.zoom()
                        .scaleExtent([0.1, 10])
                        .on('zoom', (event) => {
                            svg.selectAll('g').attr('transform', event.transform);
                        });

                    svg.call(zoom);
                </script>
            </body>
            </html>
        `;
  }
}
