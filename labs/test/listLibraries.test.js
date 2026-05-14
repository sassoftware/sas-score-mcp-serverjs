/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test for list-libraries tool using raw HTTP calls to MCP protocol
 * This test connects to an MCP server running at http://localhost:8080/mcp
 * and calls the list-libraries tool using direct HTTP requests.
 */

//import fetch from 'undici';

const MCP_SERVER_URL = 'http://localhost:8080/mcp';

/**
 * Make an MCP request using HTTP POST
 */
async function mcpRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: method,
    params: params
  };

  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`MCP error: ${data.error.message}`);
  }

  return data.result;
}

async function testListLibraries() {
  console.log('='.repeat(60));
  console.log('Testing list-libraries tool via MCP Protocol (HTTP)');
  console.log('Server: ' + MCP_SERVER_URL);
  console.log('='.repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Initialize connection (get server info)
    console.log('\n[1] Initializing connection...');
    try {
      const initResult = await mcpRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      });
      console.log('✓ Connected successfully');
      console.log(`  Server: ${initResult.serverInfo.name} v${initResult.serverInfo.version}`);
      testsPassed++;
    } catch (error) {
      console.error('✗ Connection failed:', error.message);
      testsFailed++;
      throw error;
    }

    // Test 2: List available tools
    console.log('\n[2] Listing available tools...');
    try {
      const toolsList = await mcpRequest('tools/list', {});
      console.log(`✓ Found ${toolsList.tools.length} tools`);
      
      const listLibrariesTool = toolsList.tools.find(tool => 
        tool.name.includes('sas-score-list-libraries')
      );
      
      if (!listLibrariesTool) {
        console.error('✗ list-libraries tool not found');
        testsFailed++;
        throw new Error('list-libraries tool not found');
      } else {
        console.log(`✓ Found tool: ${listLibrariesTool.name}`);
        testsPassed++;
      }

      // Store tool name for subsequent tests
      global.listLibrariesToolName = listLibrariesTool.name;
    } catch (error) {
      console.error('✗ Error listing tools:', error.message);
      testsFailed++;
      throw error;
    }

    // Test 3: List CAS libraries with defaults
    console.log('\n[3] Test: List CAS libraries (default parameters)');
    try {
      const result = await mcpRequest('tools/call', {
        name: global.listLibrariesToolName,
        arguments: {}
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.isError) {
        console.error('✗ Request returned error');
        testsFailed++;
      } else {
        console.log('✓ Successfully listed CAS libraries');
        testsPassed++;
      }
    } catch (error) {
      console.error('✗ Error:', error.message);
      testsFailed++;
    }

    // Test 4: List CAS libraries with custom limit
    console.log('\n[4] Test: List CAS libraries with limit=5');
    try {
      const result = await mcpRequest('tools/call', {
        name: global.listLibrariesToolName,
        arguments: {
          server: 'cas',
          limit: 5
        }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.isError) {
        console.error('✗ Request returned error');
        testsFailed++;
      } else {
        console.log('✓ Successfully listed CAS libraries with limit');
        testsPassed++;
      }
    } catch (error) {
      console.error('✗ Error:', error.message);
      testsFailed++;
    }

    // Test 5: List SAS libraries
    console.log('\n[5] Test: List SAS libraries');
    try {
      const result = await mcpRequest('tools/call', {
        name: global.listLibrariesToolName,
        arguments: {
          server: 'sas'
        }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.isError) {
        console.error('✗ Request returned error');
        testsFailed++;
      } else {
        console.log('✓ Successfully listed SAS libraries');
        testsPassed++;
      }
    } catch (error) {
      console.error('✗ Error:', error.message);
      testsFailed++;
    }

    // Test 6: List libraries with pagination
    console.log('\n[6] Test: List libraries with pagination (start=1, limit=3)');
    try {
      const result = await mcpRequest('tools/call', {
        name: global.listLibrariesToolName,
        arguments: {
          server: 'cas',
          start: 1,
          limit: 3
        }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.isError) {
        console.error('✗ Request returned error');
        testsFailed++;
      } else {
        console.log('✓ Successfully listed libraries with pagination');
        testsPassed++;
      }
    } catch (error) {
      console.error('✗ Error:', error.message);
      testsFailed++;
    }

    // Test 7: Case normalization (uppercase server param)
    console.log('\n[7] Test: Server parameter normalization (CAS → cas)');
    try {
      const result = await mcpRequest('tools/call', {
        name: global.listLibrariesToolName,
        arguments: {
          server: 'CAS',
          limit: 3
        }
      });
      
      console.log('Response:', JSON.stringify(result, null, 2));
      
      if (result.isError) {
        console.error('✗ Request returned error');
        testsFailed++;
      } else {
        console.log('✓ Successfully normalized server parameter');
        testsPassed++;
      }
    } catch (error) {
      console.error('✗ Error:', error.message);
      testsFailed++;
    }

  } catch (error) {
    console.error('\n✗ Fatal error:', error);
    testsFailed++;
  } finally {
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Tests Passed: ${testsPassed}`);
    console.log(`Tests Failed: ${testsFailed}`);
    console.log(`Total Tests:  ${testsPassed + testsFailed}`);
    console.log('='.repeat(60));

    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

// Run the test
testListLibraries();
