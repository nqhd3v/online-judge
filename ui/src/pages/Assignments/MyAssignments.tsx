import ActionIcons from '@/components/ActionIcons';
import CardWrapTable from '@/components/CardWrapTable';
import { EMPTY_VALUE } from '@/utils/constants';
import { TablePaginationConfig, TableProps } from 'antd';
import { SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { connect, useIntl } from 'umi';

type TableColumnsProps = TableProps<any>['columns'];

interface IMyAssignments {
  assignmentDic: Record<string, any>;
  loadingAssignments: boolean;
  dispatch: any;
  onView: (id: string) => void;
  viewingId?: string;
}

const MyAssignments: React.FC<IMyAssignments> = ({
  dispatch,
  assignmentDic,
  loadingAssignments,
  onView,
  viewingId,
}) => {
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const [totalAssignments, setTotalAssignments] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const intl = useIntl();

  const handleTableChange = (
    { current }: TablePaginationConfig,
    _: any,
    sorter: SorterResult<any> | SorterResult<any>[],
  ) => {
    const { columnKey, order } = Array.isArray(sorter) ? sorter[0] : sorter;
    const changePageCb = (data: any) => {
      if (!data) {
        return;
      }
      setCurrentIds(data.keys);
      setTotalAssignments(data.total);
      setCurrentPage(current || 1);
    };
    dispatch({
      type: 'assignments/search',
      payload: {
        callback: changePageCb,
        page: current || 1,
        limit: 10,
        sorter_field: columnKey || 'created_at',
        sorter_type: order === 'ascend' ? 'ASC' : 'DESC',
      },
    });
  };

  const columns: TableColumnsProps = [
    {
      title: intl.formatMessage({ id: 'component.table.name' }),
      key: 'name',
      width: 200,
      fixed: 'left',
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.coefficient' }),
      key: 'coefficient',
      width: 110,
      dataIndex: 'coefficient',
      render: (coefficient, { finished }) => {
        if (finished) return intl.formatMessage({ id: 'assignment.finished' });
        if (coefficient === 'error')
          return intl.formatMessage({ id: 'assignment.coefficient.error' });
        if (!Number.isNaN(coefficient)) return `${coefficient} %`;
        return coefficient || EMPTY_VALUE;
      },
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.submissions' }),
      key: 'submissions',
      dataIndex: 'submissions',
      width: 110,
      render: (submissions) => submissions.length,
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.start-time' }),
      key: 'start_time',
      sorter: true,
      width: 150,
      dataIndex: 'startTime',
      render: (time) => (time ? moment(time).format('DD/MM/YYYY HH:mm') : EMPTY_VALUE),
    },
    {
      title: intl.formatMessage({ id: 'assignment.table.finish-time' }),
      key: 'finish_time',
      sorter: true,
      width: 150,
      dataIndex: 'finishTime',
      render: (time) => (time ? moment(time).format('DD/MM/YYYY HH:mm') : EMPTY_VALUE),
    },
    {
      title: intl.formatMessage({ id: 'component.table.action' }),
      key: 'action',
      width: 100,
      fixed: 'right',
      dataIndex: 'id',
      render: (id) => (
        <ActionIcons
          actions={[
            {
              key: 'view',
              action: () => onView(id),
              icon: 'view',
              disabled: id === viewingId,
            },
          ]}
        />
      ),
    },
  ];

  useEffect(() => {
    const callback = (res: any) => {
      if (!res) {
        return;
      }
      setCurrentIds(res.keys);
    };
    dispatch({ type: 'assignments/search', payload: { callback } });
  }, []);
  return (
    <CardWrapTable
      cardTitle={intl.formatMessage({ id: 'site.my-assignments' })}
      columns={columns}
      loading={loadingAssignments}
      dataSource={currentIds.map((id) => assignmentDic[id])}
      tableLayout="fixed"
      pagination={{
        current: currentPage,
        total: totalAssignments,
        pageSize: 10,
        showSizeChanger: false,
      }}
      scroll={{ x: '100%' }}
      rowKey="id"
      onChange={handleTableChange}
    />
  );
};

export default connect(({ assignments, loading }: any) => ({
  loadingAssignments: loading.effects['assignments/search'],
  assignmentDic: assignments.dic,
}))(MyAssignments);
