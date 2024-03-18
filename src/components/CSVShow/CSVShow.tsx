import {
  Alert,
  Button,
  Card,
  CardFooter,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Typography,
} from '@material-tailwind/react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Papa from 'papaparse';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const dataTypes = [
  'object',
  'int64',
  'int32',
  'int16',
  'int8',
  'float64',
  'float32',
  'bool',
  'datetime64',
  'timedelta[ns]',
  'category',
  'complex',
];

const dataTypeMapping = {
  object: 'Text',
  int64: 'Big Integer',
  int32: 'Integer (32-bit)',
  int16: 'Integer (16-bit)',
  int8: 'Integer (8-bit)',
  float64: 'Big Float',
  float32: 'Float (32-bit)',
  bool: 'Boolean',
  datetime64: 'DateTime',
  'timedelta[ns]': 'Time Delta',
  category: 'Category',
  complex: 'Complex Number',
}

const CSVShow = () => {
  const location = useLocation();
  const initialData = location.state; // Assuming location.state contains initial data

  // State variables to manage the data
  const [csvData, setCSVData] = useState(initialData.csvData);
  const [csvHeader, setCSVHeader] = useState(initialData.csvHeader);
  const [rawData, setRawData] = useState(initialData.rawData);

  const navigate = useNavigate();


  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const [openAlert, setOpenAlert] = useState(false);
  const [openAlertMassage, setOpenAlertMassage] = useState<string>('');

  const handleChangePage = (_event: null, newPage: number) => {
    setPage(newPage);
  };

  const [selectedDataTypes, setSelectedDataTypes] = useState({});

  const handleDataTypeSelect = (header: string, dataType: string) => {
    // Update state with selected header and data type
    setSelectedDataTypes((prevData) => ({
      ...prevData,
      [header]: dataType,
    }));
  };

  const back = () => {
    
    navigate('/');
  }

  const convertToCSVAndUpload = async () => {
    try {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([rawData], { type: 'application/vnd.ms-excel' }),
        'sample_data.csv',
      );
      formData.append('json_data', JSON.stringify({ ...selectedDataTypes }));

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/infer_type/upload-csv/`,
          {
            method: 'POST',
            credentials: 'include',
            body: formData,
          },
        );

        if (response.ok) {
          const data = await response.text();
          const parsedCsv = Papa.parse(data);
          setRawData(Papa.unparse(parsedCsv));
          Papa.parse(data, {
            delimiter: ',',
            header: true,
            complete: (result) => {
              setCSVHeader(result.meta.fields); // Get headers

              const rows = result.data.filter((row: any) =>
                Object.values(row).some((value) => value !== ''),
              ); // Filter out empty rows
              setRawData(Papa.unparse(rows));

              setCSVData(rows);
            },

            error: (error: any) => {
              setOpenAlert(true);
              setOpenAlertMassage('error to parse');
            },
          });
        } else {
          setOpenAlert(true);
          setOpenAlertMassage('error to get data');
        }
      } catch (error: any) {
        setOpenAlert(true);
        setOpenAlertMassage('error to get data');
      }
    } catch (error: any) {
      setOpenAlert(true);
      setOpenAlertMassage('error to get data');
    }
    setSelectedDataTypes({});
  };

  return (
    <>
      {' '}
      <Card className="h-full w-full overflow-scroll">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {csvHeader.map((header) => (
                  <TableCell key={header} style={{ minWidth: 170 }}>
                    <Menu>
                      <MenuHandler>
                        <Button>
                          {header}
                        </Button>
                      </MenuHandler>
                      <MenuList className="max-h-40 overflow-y-auto">
                        {dataTypes.map((dataType) => (
                          <MenuItem
                            key={dataType}
                            onClick={() =>
                              handleDataTypeSelect(header, dataType)
                            }
                          >
                            <FormControlLabel
                              control={<Radio />}
                              name={header}
                              value={dataType}
                              checked={selectedDataTypes[header] === dataType}
                              onChange={() =>
                                handleDataTypeSelect(header, dataType)
                              }
                              label={dataTypeMapping[dataType] || dataType} // Use mapped name if exists, otherwise use original name
                            />
                            {/* {dataType} */}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {csvData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index}>
                    {csvHeader.map((header) => (
                      <TableCell key={header}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {row[header]}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page {page + 1} of {Math.ceil(csvData.length / rowsPerPage)}
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => handleChangePage(null, page - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => handleChangePage(null, page + 1)}
              disabled={page === Math.ceil(csvData.length / rowsPerPage) - 1}
            >
              Next
            </Button>
            <Button
              size="sm"
              onClick={() => back()}
            >
              exit
            </Button>
          </div>
        </CardFooter>

        <Button
          className="flex w-full items-center justify-center"
          onClick={convertToCSVAndUpload}
        >
          submit
        </Button>
        <Alert
          open={openAlert}
          onClose={() => setOpenAlert(false)}
          animate={{
            mount: { y: 0 },
            unmount: { y: 100 },
          }}
          color="red"
        >
          {openAlertMassage}
        </Alert>
      </Card>
    </>
  );
};

export default CSVShow;
