import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { readFileSync } from 'fs';  // Importa la función readFileSync de fs
import { resolve, dirname } from 'path';  // Importa la función resolve de path
import { fileURLToPath } from 'url';
import { AgGridReact } from 'ag-grid-react';

export const loader = ({ request }: LoaderFunctionArgs) => {
  try {
    // Obtiene la ruta completa al archivo data.json
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFile);
    const dataPath = resolve(currentDir, '../app/data.json');

    // Lee el contenido del archivo de forma síncrona
    const dataContent = readFileSync(dataPath, 'utf-8');
    
    // Parsea el contenido como JSON
    const jsonData = JSON.parse(dataContent);

    // Devuelve los datos como respuesta JSON
    return json({ data: jsonData });
  } catch (error) {
    console.error("Error al leer o parsear el archivo:", error);
    throw error;
  }
};


export default function Roles() {
  const loaderData = useLoaderData<typeof loader>()
  const data = loaderData.data

  console.log(data);

  const columns = [
    { field: "Nombre" },
    { field: "Descripcion" },
    { field: "Grupo" },
  ]

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-blue-600">PRUEBA</h2>
        <AgGridReact rowData={data} columnDefs={columns} />
      </div>
    </div>
  )
}
