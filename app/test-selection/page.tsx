'use client'

import { Box, Typography, Button, Card, Table, Sheet } from '@/components/ui/joy-ui';
import { ContentCopyRounded } from '@mui/icons-material';

export default function TestSelectionPage() {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied: ' + text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testData = [
    { id: '12345', name: 'John Doe', phone: '+84 123 456 789', email: 'john@example.com' },
    { id: '67890', name: 'Jane Smith', phone: '+84 987 654 321', email: 'jane@example.com' },
    { id: '11111', name: 'Bob Johnson', phone: '+84 555 666 777', email: 'bob@example.com' }
  ];

  return (
    <Box className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <Box className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <Typography level="h1" className="text-2xl font-bold select-text">
            🧪 Text Selection Test Page
          </Typography>
          <Typography level="body-lg" className="text-gray-600 select-text">
            Test to verify that text can be selected and copied throughout the website.
          </Typography>
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <Typography level="h2" className="text-xl font-semibold mb-4 select-text">
            📋 Instructions
          </Typography>
          <Box className="space-y-3">
            <Typography className="select-text">
              ✅ Try to select this text with your mouse - it should highlight in blue
            </Typography>
            <Typography className="select-text">
              ✅ Try double-clicking on individual words to select them
            </Typography>
            <Typography className="select-text">
              ✅ Try triple-clicking to select entire paragraphs
            </Typography>
            <Typography className="select-text">
              ✅ Use Ctrl+A to select all text on the page
            </Typography>
            <Typography className="select-text">
              ✅ Use Ctrl+C to copy selected text after highlighting it
            </Typography>
          </Box>
        </Card>

        {/* Sample Data Card */}
        <Card className="p-6">
          <Typography level="h2" className="text-xl font-semibold mb-4 select-text">
            📊 Sample Data (should be selectable)
          </Typography>
          
          <Box className="space-y-4">
            {/* Text Examples */}
            <Box className="p-4 bg-gray-50 rounded-lg">
              <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                User ID:
              </Typography>
              <Typography className="font-mono text-lg select-text">
                USER_123456789_ABCDEF
              </Typography>
            </Box>

            <Box className="p-4 bg-gray-50 rounded-lg">
              <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                Phone Number:
              </Typography>
              <Typography className="font-mono text-lg select-text">
                +84 123 456 789
              </Typography>
            </Box>

            <Box className="p-4 bg-gray-50 rounded-lg">
              <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                Email Address:
              </Typography>
              <Typography className="font-mono text-lg select-text">
                user.email@example.com
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Table Test */}
        <Card className="p-6">
          <Typography level="h2" className="text-xl font-semibold mb-4 select-text">
            📋 Table Data Test
          </Typography>
          
          <Sheet className="border rounded-lg overflow-hidden">
            <Table hoverRow>
              <thead>
                <tr>
                  <th className="p-3">
                    <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                      ID
                    </Typography>
                  </th>
                  <th className="p-3">
                    <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                      Name
                    </Typography>
                  </th>
                  <th className="p-3">
                    <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                      Phone
                    </Typography>
                  </th>
                  <th className="p-3">
                    <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                      Email
                    </Typography>
                  </th>
                  <th className="p-3">
                    <Typography level="body-sm" className="font-semibold text-gray-700 select-text">
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {testData.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 group">
                    <td className="p-3" style={{ userSelect: 'text' }}>
                      <Box className="flex items-center justify-between">
                        <Typography className="font-mono select-text">
                          {user.id}
                        </Typography>
                        <Button
                          size="sm"
                          variant="plain"
                          onClick={() => copyToClipboard(user.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity select-none"
                        >
                          <ContentCopyRounded />
                        </Button>
                      </Box>
                    </td>
                    <td className="p-3" style={{ userSelect: 'text' }}>
                      <Box className="flex items-center justify-between">
                        <Typography className="select-text">
                          {user.name}
                        </Typography>
                        <Button
                          size="sm"
                          variant="plain"
                          onClick={() => copyToClipboard(user.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity select-none"
                        >
                          <ContentCopyRounded />
                        </Button>
                      </Box>
                    </td>
                    <td className="p-3" style={{ userSelect: 'text' }}>
                      <Box className="flex items-center justify-between">
                        <Typography className="font-mono select-text">
                          {user.phone}
                        </Typography>
                        <Button
                          size="sm"
                          variant="plain"
                          onClick={() => copyToClipboard(user.phone)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity select-none"
                        >
                          <ContentCopyRounded />
                        </Button>
                      </Box>
                    </td>
                    <td className="p-3" style={{ userSelect: 'text' }}>
                      <Box className="flex items-center justify-between">
                        <Typography className="select-text">
                          {user.email}
                        </Typography>
                        <Button
                          size="sm"
                          variant="plain"
                          onClick={() => copyToClipboard(user.email)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity select-none"
                        >
                          <ContentCopyRounded />
                        </Button>
                      </Box>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="soft"
                        color="primary"
                        onClick={() => copyToClipboard(`${user.name}\n${user.phone}\n${user.email}`)}
                        className="select-none"
                      >
                        Copy All
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Card>

        {/* Status Report */}
        <Card className="p-6">
          <Typography level="h2" className="text-xl font-semibold mb-4 select-text">
            ✅ Status Report
          </Typography>
          <Box className="space-y-2">
            <Typography className="select-text">
              🔧 <strong>Fixed:</strong> Table component user-select override
            </Typography>
            <Typography className="select-text">
              🔧 <strong>Fixed:</strong> Global CSS forcing text selection
            </Typography>
            <Typography className="select-text">
              🔧 <strong>Fixed:</strong> Joy UI component conflicts
            </Typography>
            <Typography className="select-text">
              🔧 <strong>Added:</strong> Copy buttons for quick copying
            </Typography>
            <Typography className="select-text">
              🔧 <strong>Added:</strong> Utility classes for selection control
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
