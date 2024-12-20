import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import axios from 'axios';

interface DataItem {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number;
  date_end: number;
}

function extractArtworkDetails(data: any[]): DataItem[] {
  return data.map((item) => ({
    id: item.id,  
    title: item.title,
    place_of_origin: item.place_of_origin || "Unknown",
    artist_display: item.artist_display || "Unknown",
    inscriptions: item.inscriptions || null,
    date_start: item.date_start || 0,
    date_end: item.date_end || 0,
  }));
}

const DataTableComponent: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [first, setFirst] = useState<number>(0);
  const [page,setPage]=useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<DataItem[]>([]);
  const numRowsToSelect = useRef<number>(0);
  const overlayPanelRef = useRef<OverlayPanel>(null);

  const fetchData = async (page: number) => {
    try {
      const pageNumber = page + 1;
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
      );
      const artworkDetails = extractArtworkDetails(response.data.data);
      setData(artworkDetails);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const onPageChange = (event: { page: number , first:number }) => {
    console.log("event",event);
    setFirst(event.first);
    setPage(event.page);
  };

  const onRowSelect = (event: { value: DataItem[] }) => {
    setSelectedRows(event.value);
  };

  const selectRows = useCallback(() => {
    let temp: number = 0;
    if (numRowsToSelect.current > (page + 1) * 12) {
        temp = 12;
    } else if (
        numRowsToSelect.current < (page + 1) * 12 &&
        (page + 1) * 12 - numRowsToSelect.current < 12
    ) {
        temp = numRowsToSelect.current % 12;
    } else {
        temp = 0;
    }

    const rowsToSelect = data.slice(0, Math.min(temp, data.length));
    console.log("number of rows", numRowsToSelect.current);
    setSelectedRows(rowsToSelect);
    overlayPanelRef.current?.hide();
}, [data, numRowsToSelect, page]);

useEffect(() => {
  if (numRowsToSelect.current !== 0) {
    selectRows();
  }
}, [selectRows]);

  const rowSelectionTemplate = (rowData: DataItem) => {
    const isSelected = selectedRows.some((row) => row.id === rowData.id);
    return isSelected ? (
      <i className="pi pi-check-circle text-green-500" />
    ) : (
      <i className="pi pi-circle-off text-gray-500" />
    );
  };

const checkboxHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight:"0.5rem" ,cursor:'pointer'}} onClick={(e) => overlayPanelRef.current?.toggle(e)}>
      <i className="pi pi-check text-blue-500" title="Select Rows" />
    </div>
  );

  const handleValueChange = (e:any) => {
    numRowsToSelect.current = e.value || 0;  
     
  };

  return (
    <div className="card">
      <h2>Custom Row Selection with OverlayPanel</h2>
  
     

      <OverlayPanel ref={overlayPanelRef} style={{ width: '250px', zIndex:1000 }}>
        <h3>Select Rows</h3>
        <InputNumber
          value={numRowsToSelect.current}
          onValueChange={handleValueChange}
          placeholder="Number of rows"
        />
        <Button label="Submit" icon="pi pi-check" onClick={selectRows} />
      </OverlayPanel>

      <DataTable
        value={data}
        selectionMode="checkbox"
        selection={selectedRows}
        onSelectionChange={onRowSelect}
        dataKey="id"
      >
        <Column
          selectionMode="multiple"
          header={checkboxHeader}
          style={{ width: '3em' }}
          body={rowSelectionTemplate}
        />
        <Column field="id" header="ID" style={{ display: 'none' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
      <Paginator
        first={first}
        rows={12}
        totalRecords={240}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default DataTableComponent;

 