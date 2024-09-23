import * as vscode from "vscode";
import * as path from "path";
import * as d3 from "d3";

export class GraphVisualization {
  private panel: vscode.WebviewPanel | undefined;

  constructor(
    private context: vscode.ExtensionContext,
    private workspaceRoot: string
  ) {}

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

    // Adjust file paths in the data
    data.nodes = data.nodes.map((node: any) => {
      if (node.type === "file") {
        node.fullPath = path.join(this.workspaceRoot, node.id);
        node.path = node.id;
        node.fileName = path.basename(node.id);
      }
      return node;
    });

    this.panel.webview.html = this.getWebviewContent(data);

    // Set up the message listener
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "openFile":
            const filePath = message.file.startsWith(this.workspaceRoot)
              ? message.file
              : path.join(this.workspaceRoot, message.file);
            vscode.workspace.openTextDocument(filePath).then((doc) => {
              vscode.window.showTextDocument(doc);
            });
            return;
        }
      },
      undefined,
      this.context.subscriptions
    );
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
                        font: 10px sans-serif;
                        fill: white;
                        stroke: black;
                        stroke-width: 0.5px;
                    }
                    .node circle {
                        stroke: #fff;
                        stroke-width: 1.5px;
                        cursor: pointer;
                    }
                    .link {
                        stroke: #999;
                        stroke-opacity: 0.6;
                    }
                    .tooltip {
                        position: absolute;
                        background-color: rgba(0, 0, 0, 0.7);
                        color: white;
                        padding: 5px;
                        border-radius: 5px;
                        font-size: 12px;
                        pointer-events: none;
                    }
                </style>
            </head>
            <body>
                <div id="graph"></div>
                <div class="tooltip" style="opacity: 0;"></div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const data = ${JSON.stringify(data)};
                    
                    const width = window.innerWidth;
                    const height = window.innerHeight;

                    const svg = d3.select('#graph')
                        .append('svg')
                        .attr('width', width)
                        .attr('height', height);

                    const g = svg.append('g');

                    const tooltip = d3.select('.tooltip');

                    const simulation = d3.forceSimulation(data.nodes)
                        .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
                        .force('charge', d3.forceManyBody().strength(-300))
                        .force('center', d3.forceCenter(width / 2, height / 2))
                        .force('collide', d3.forceCollide().radius(30));

                    const link = g.append('g')
                        .attr('class', 'links')
                        .selectAll('line')
                        .data(data.links)
                        .enter().append('line')
                        .attr('class', 'link');

                    const node = g.append('g')
                        .attr('class', 'nodes')
                        .selectAll('.node')
                        .data(data.nodes)
                        .enter().append('g')
                        .attr('class', 'node')
                        .call(d3.drag()
                            .on('start', dragstarted)
                            .on('drag', dragged)
                            .on('end', dragended))
                        .on('click', clicked)
                        .on('mouseover', showTooltip)
                        .on('mouseout', hideTooltip);

                    node.append('circle')
                        .attr('r', 6)
                        .attr('fill', d => {
                            if (d.type === 'file') return '#4CAF50';
                            if (d.id.toLowerCase().includes('enum')) return '#3F51B5';
                            if (d.id.startsWith('I')) return '#FF9800';
                            return '#E91E63';
                        });

                    node.append('text')
                        .attr('dy', -10)
                        .attr('text-anchor', 'middle')
                        .text(d => d.type === 'file' ? d.fileName : d.id);

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

                    function clicked(event, d) {
                        if (d.type === 'file') {
                            vscode.postMessage({
                                command: 'openFile',
                                file: d.path || d.id
                            });
                        }
                    }

                    function showTooltip(event, d) {
                        if (d.type === 'file') {
                            tooltip.transition()
                                .duration(200)
                                .style('opacity', .9);
                            tooltip.html(d.path || d.id)
                                .style('left', (event.pageX + 10) + 'px')
                                .style('top', (event.pageY - 28) + 'px');
                        }
                    }

                    function hideTooltip() {
                        tooltip.transition()
                            .duration(500)
                            .style('opacity', 0);
                    }

                    // Add zoom functionality
                    const zoom = d3.zoom()
                        .scaleExtent([0.1, 10])
                        .on('zoom', (event) => {
                            g.attr('transform', event.transform);
                        });

                    svg.call(zoom);

                    // Center the graph initially
                    const initialScale = 0.75;
                    svg.call(zoom.transform, d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(initialScale)
                        .translate(-width / 2, -height / 2));

                    // Stop the simulation after a short time
                    setTimeout(() => simulation.stop(), 3000);
                </script>
            </body>
            </html>
        `;
  }
}
