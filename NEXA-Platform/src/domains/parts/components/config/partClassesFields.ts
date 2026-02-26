/**
 * part_classes 테이블 필드 정의
 * 테이블 뷰의 컬럼 정의 및 카드/리스트 등 모든 뷰 모드의 필드 정의로 사용
 */

export interface PartClassField {
  name: string
  label: string
  field: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  style?: string
}

export const partClassesFields: PartClassField[] = [
  {
    name: 'id',
    label: 'ID.',
    field: 'id',
    align: 'left',
    sortable: false,
    style: 'width: 80px; min-width: 80px;',
  },
  {
    name: 'sort_order',
    label: 'Sort Order',
    field: 'sort_order',
    align: 'center',
    sortable: true,
    style: 'width: 100px; font-weight: bold; color: #1976d2;',
  },
  {
    name: 'sub_sort_order',
    label: 'Sub Sort',
    field: 'sub_sort_order',
    align: 'center',
    sortable: true,
    style: 'width: 100px; font-weight: bold; color: #d32f2f;',
  },
  {
    name: 'category',
    label: 'Category',
    field: 'category',
    align: 'left',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'name',
    label: 'Class Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'c_code',
    label: 'C Code',
    field: 'c_code',
    align: 'left',
    sortable: true,
    style: 'width: 100px',
  },
  {
    name: 'code_name',
    label: 'C Name',
    field: 'code_name',
    align: 'left',
    sortable: true,
    style: 'width: 150px',
  },
  {
    name: 'example',
    label: 'Ex',
    field: 'example',
    align: 'left',
    style: 'max-width: 250px',
  },
  {
    name: 'description',
    label: 'Desc',
    field: 'description',
    align: 'left',
    style: 'max-width: 300px',
  },
  {
    name: 'updated_at',
    label: 'Updated At',
    field: 'updated_at',
    align: 'left',
    sortable: true,
    style: 'width: 160px',
  },
  {
    name: 'created_at',
    label: 'Created At',
    field: 'created_at',
    align: 'left',
    sortable: true,
    style: 'width: 160px',
  },
]
