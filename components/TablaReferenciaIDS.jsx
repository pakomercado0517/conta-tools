import { Table } from "flowbite-react";

export default function TablaReferenciaIDS() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Head>
          <Table.HeadCell>Años de trabajo</Table.HeadCell>
          <Table.HeadCell>Días de aguinaldo</Table.HeadCell>
          <Table.HeadCell>Días de vacaciones</Table.HeadCell>
          <Table.HeadCell>Prima vacacional</Table.HeadCell>
          <Table.HeadCell>Factor de integración</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>1</Table.Cell>
            <Table.Cell>15</Table.Cell>
            <Table.Cell>12</Table.Cell>
            <Table.Cell>25%</Table.Cell>
            <Table.Cell>1.0493</Table.Cell>
          </Table.Row>
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>2</Table.Cell>
            <Table.Cell>15</Table.Cell>
            <Table.Cell>14</Table.Cell>
            <Table.Cell>25%</Table.Cell>
            <Table.Cell>1.0507</Table.Cell>
          </Table.Row>
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>3</Table.Cell>
            <Table.Cell>15</Table.Cell>
            <Table.Cell>16</Table.Cell>
            <Table.Cell>25%</Table.Cell>
            <Table.Cell>1.0521</Table.Cell>
          </Table.Row>
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>4</Table.Cell>
            <Table.Cell>15</Table.Cell>
            <Table.Cell>18</Table.Cell>
            <Table.Cell>25%</Table.Cell>
            <Table.Cell>1.0534</Table.Cell>
          </Table.Row>
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>5</Table.Cell>
            <Table.Cell>15</Table.Cell>
            <Table.Cell>20</Table.Cell>
            <Table.Cell>25%</Table.Cell>
            <Table.Cell>1.0548</Table.Cell>
          </Table.Row>
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell>6 a 10</Table.Cell>
            <Table.Cell>15</Table.Cell>
            <Table.Cell>22</Table.Cell>
            <Table.Cell>25%</Table.Cell>
            <Table.Cell>1.0562</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  );
}
