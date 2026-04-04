import { NextRequest, NextResponse } from 'next/server'
import { runFullScan } from '@/utils/scan/engine'

/**
 * Zynth Model Context Protocol (MCP) Server (Stage 7.2)
 * -----------------------------------------------------
 * This endpoint implements the MCP JSON-RPC protocol.
 * It allows external AI agents (like Claude Desktop) to use Zynth as a tool.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { method, params, id } = body

    // 1. MCP Tool Discovery
    if (method === 'list_tools') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'run_security_audit',
              description: 'Perform a comprehensive security audit on a website or API.',
              inputSchema: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'The target URL to audit (must start with https://)' }
                },
                required: ['url']
              }
            },
            {
              name: 'get_remediation_patch',
              description: 'Generate an AI-powered code patch for a known vulnerability.',
              inputSchema: {
                type: 'object',
                properties: {
                  issueId: { type: 'string', description: 'The unique ID of the scan issue' }
                },
                required: ['issueId']
              }
            }
          ]
        }
      })
    }

    // 2. MCP Tool Execution
    if (method === 'call_tool') {
      const { name, arguments: args } = params

      if (name === 'run_security_audit') {
        const results = await runFullScan(args.url)
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Audit complete for ${args.url}. Found ${results.length} issues. Top severity: ${results[0]?.severity || 'NONE'}`
              },
              {
                type: 'resource',
                uri: `zynth://scan/${args.url}`,
                mimeType: 'application/json',
                text: JSON.stringify(results, null, 2)
              }
            ]
          }
        })
      }
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: 'Method not found' }
    }, { status: 404 })

  } catch (err) {
    console.error('[ZYNTH_MCP] Error:', err)
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' }
    }, { status: 500 })
  }
}
