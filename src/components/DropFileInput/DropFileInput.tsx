import React, { ChangeEvent, useEffect, useRef, useState } from 'react'; // Import ChangeEvent type
import './drop-file-input.css';
import { Alert, Button } from '@material-tailwind/react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import uploadImg from '../../assets/cloud-upload-regular-240.png';
import { ImageConfig } from '../../config/ImageConfig.ts';

const DropFileInput = () => {
  const wrapperRef = useRef<HTMLDivElement>(null); // Specify the type of useRef
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Specify the type of useState
  const [csvHeaderType, setCSVHeaderType] = useState<string | null>(null); // Specify the type of useState
  const [openAlert, setOpenAlert] = useState<boolean>(false); // Specify the type of useState
  const [openAlertMassage, setOpenAlertMassage] = useState<string>(''); // Specify the type of useState
  const navigate = useNavigate();

  const [fileList, setFileList] = useState<any>([]); // Specify the type of useState

  const onDragEnter = () => wrapperRef.current!.classList.add('dragover'); // Use non-null assertion operator (!)

  const onDragLeave = () => wrapperRef.current!.classList.remove('dragover'); // Use non-null assertion operator (!)

  const onDrop = () => wrapperRef.current!.classList.remove('dragover'); // Use non-null assertion operator (!)

  const onFileDrop = (e: ChangeEvent<HTMLInputElement>) => {
    // Use ChangeEvent type
    const file = e.target.files![0]; // Use non-null assertion operator (!)
    setSelectedFile(file);
    const newFile = e.target.files![0]; // Use non-null assertion operator (!)
    if (newFile) {
      const updatedList: any[] = [...fileList, newFile];
      setFileList(updatedList);
    }
  };

  const fileRemove = (file: any) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    setFileList(updatedList);
  };

  const uploadFile = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/infer_type/upload-csv/`,
        {
          method: 'POST',
          body: formData,
        },
      )
        .then(async (response) => {
          if (response.ok) {
            let csvData = await response.text();
            const parsedCsv = Papa.parse(csvData);
            
            Papa.parse(csvData, {
              delimiter: ',',
              header: true,
              complete: (result) => {
                const headers = result.meta.fields; // Get headers

                const rows = result.data.filter((row: any) =>
                  Object.values(row).some((value) => value !== ''),
                ); // Filter out empty rows

                navigate('/csv', {
                  state: {
                    csvData: rows,
                    csvHeader: headers,
                    rawData: Papa.unparse(parsedCsv),
                    colsType: csvHeaderType,
                  },
                });
              },

              error: (error: Error) => {
                setOpenAlert(true);
                setOpenAlertMassage(error.message);
              },
            });
          } else {
            setOpenAlert(true);
            setOpenAlertMassage('file invalid');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setOpenAlert(true);
          setOpenAlertMassage('upload fail');
        });
    }
  };

  return (
    <>
      <div className="max-w-sm overflow-hidden rounded shadow-lg">
        <div className="px-6 py-4 text-center">
          <h2 className="mb-2 text-xl font-bold">Ready to accept CSV files</h2>
          <div
            ref={wrapperRef}
            className="drop-file-input h-200 relative flex items-center justify-center rounded-lg border-2 border-dashed border-gray-500 bg-gray-200"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="drop-file-input__labelflex items-center justify-center p-10">
              <img src={uploadImg} alt="upload" />
              <p>Drag & Drop your files here</p>
            </div>
            <input type="file" value="" onChange={onFileDrop} />
          </div>
          {fileList.length > 0 ? (
            <div className="drop-file-preview">
              <p className="drop-file-preview__title">Ready to upload</p>
              {fileList.map((item, index) => (
                <div key={index} className="drop-file-preview__item">
                  <img
                    src={
                      ImageConfig[item.type.split('/')[1]] ||
                      ImageConfig['default']
                    }
                    alt=""
                  />
                  <div className="drop-file-preview__item__info">
                    <p>{item.name}</p>
                    <p>{item.size}B</p>
                  </div>
                  <span
                    className="drop-file-preview__item__del"
                    onClick={() => fileRemove(item)}
                  >
                    x
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col pt-5">
            <div>
              <Button
                className="flex w-full items-center justify-center"
                onClick={uploadFile}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                Upload Files
              </Button>
            </div>
          </div>
        </div>
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
      </div>
    </>
  );
};

export default DropFileInput;
