import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiSearch, FiDownload, FiTrash2, FiEdit } from 'react-icons/fi';
import { useEvents } from '../services/swrHooks';
import { deleteEvent } from '../services/eventService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const EventsTable = ({ onEdit }) => {
  const { data, error, isLoading, mutate } = useEvents();
  const events = data?.data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });
  const toast = useToast();

  // Colors
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (events) {
      let filtered = [...events];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (event) =>
            (event.name || event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          // Handle name/title field difference
          if (sortConfig.key === 'name' && (!a.name || !b.name)) {
            const aValue = a.name || a.title || '';
            const bValue = b.name || b.title || '';
            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          }
          
          // Handle date field difference
          if (sortConfig.key === 'date' && (!a.date || !b.date)) {
            const aValue = a.date || a.start || '';
            const bValue = b.date || b.start || '';
            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          }
          
          // Default sorting
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      
      setFilteredEvents(filtered);
    }
  }, [events, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        mutate(); // Refresh the data
        toast({
          title: 'Event deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error deleting event',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Events Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare table data
    const tableColumn = ["Name", "Date", "Location", "Type", "Description"];
    const tableRows = filteredEvents.map(event => [
      event.name || event.title,
      new Date(event.date || event.start).toLocaleDateString(),
      event.location || '',
      event.type ? (event.type.toLowerCase() === 'marché' ? 'Marché' : 'Collecte') : (event.status || ''),
      (event.description || '').substring(0, 30) + (event.description && event.description.length > 30 ? '...' : '')
    ]);
    
    // Generate PDF table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      columnStyles: {
        4: { cellWidth: 50 } // Description column width
      }
    });
    
    // Save the PDF
    doc.save('events_report.pdf');
    
    toast({
      title: 'PDF exported successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const exportToExcel = () => {
    // Prepare data
    const worksheet = XLSX.utils.json_to_sheet(
      filteredEvents.map(event => ({
        Name: event.name || event.title,
        Date: new Date(event.date || event.start).toLocaleDateString(),
        Location: event.location || '',
        Type: event.type ? (event.type.toLowerCase() === 'marché' ? 'Marché' : 'Collecte') : (event.status || ''),
        Description: event.description || ''
      }))
    );
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
    
    // Generate Excel file
    XLSX.writeFile(workbook, 'events_report.xlsx');
    
    toast({
      title: 'Excel exported successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return <Text>Loading events...</Text>;
  }

  if (error) {
    return <Text>Error loading events</Text>;
  }

  return (
    <Box>
      <Flex mb={4} justifyContent="space-between" alignItems="center">
        <Flex alignItems="center">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
            mr={2}
          />
          <IconButton
            aria-label="Search"
            icon={<FiSearch />}
            colorScheme="blue"
          />
        </Flex>
        <Flex>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="green"
            variant="outline"
            mr={2}
            onClick={exportToPDF}
          >
            Export PDF
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="green"
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
        </Flex>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th 
                color={textColor} 
                onClick={() => handleSort('name')}
                cursor="pointer"
              >
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </Th>
              <Th 
                color={textColor} 
                onClick={() => handleSort('date')}
                cursor="pointer"
              >
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </Th>
              <Th 
                color={textColor} 
                onClick={() => handleSort('location')}
                cursor="pointer"
              >
                Location {sortConfig.key === 'location' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </Th>
              <Th 
                color={textColor} 
                onClick={() => handleSort('type')}
                cursor="pointer"
              >
                Type {sortConfig.key === 'type' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </Th>
              <Th color={textColor}>Description</Th>
              <Th color={textColor}>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Tr key={event._id}>
                  <Td color={textColor}>{event.name || event.title}</Td>
                  <Td color={textColor}>{new Date(event.date || event.start).toLocaleDateString()}</Td>
                  <Td color={textColor}>{event.location || ''}</Td>
                  <Td>
                    {event.type ? (
                      <Box 
                        as="span" 
                        px={2} 
                        py={1} 
                        borderRadius="full" 
                        fontSize="xs" 
                        fontWeight="semibold"
                        bg={event.type.toLowerCase() === 'marché' ? 'blue.100' : 'green.100'}
                        color={event.type.toLowerCase() === 'marché' ? 'blue.500' : 'green.500'}
                      >
                        {event.type.toLowerCase() === 'marché' ? 'Marché' : 'Collecte'}
                      </Box>
                    ) : (
                      <Text color={textColor}>{event.status || ''}</Text>
                    )}
                  </Td>
                  <Td color={textColor}>
                    {event.description && event.description.length > 50
                      ? `${event.description.substring(0, 50)}...`
                      : (event.description || '')}
                  </Td>
                  <Td>
                    <Flex>
                      <IconButton
                        aria-label="Edit event"
                        icon={<FiEdit />}
                        colorScheme="blue"
                        size="sm"
                        mr={2}
                        onClick={() => onEdit(event)}
                      />
                      <IconButton
                        aria-label="Delete event"
                        icon={<FiTrash2 />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(event._id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  No events found
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default EventsTable;
