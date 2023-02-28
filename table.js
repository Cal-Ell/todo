import React, { useEffect, useState, useRef } from 'react';
import { useTable, usePagination, useRowSelect, useFilters, useGlobalFilter, useSortBy, } from 'react-table';
import { useDispatch, useSelector } from "react-redux";
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@mui/material/Button';
import { Row, Col, } from "react-bootstrap";
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import './table.css';
import { setRunId, setInstrumentId, setRunListDownloadData, setIsAllRunListDataShown, setIsRunDataLoading, saveAnalysisCommentData, saveDetailsData, setAnalysisCommentDataSaved, setDetailsDataSaved, setEditMode, getRunDataAllAsync, setRunListData, } from "../actions/index";
import * as Filters from './filters';
import CustomFilter from '../customfilter/customfilter';
import * as Utils from '../../utils/utils';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import { CSVLink } from "react-csv";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ViewListIcon from '@mui/icons-material/ViewList';
import ManageColumns from '../managecolumns/managecolumns';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import useStickyHeader from "../../utils/hooks/useStickyHeader";
import Container from '@mui/material/Container';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Badge from '@mui/material/Badge';
import { findAll } from "highlight-words-core";
import Tooltip from '@material-ui/core/Tooltip';

function Table({ columns, data, handleRowClick, selectedRowIndex, handleClearAdvancedSearch, }) {
    const [isCustomFiltersShowing, showCustomFilters] = useState(false);
    const [isManageColumnsShowing, showManageColumns] = useState(false);

    const local_state = useSelector(state => state);

    const dispatch = useDispatch();

    const { tableRef, isSticky, isStickyRow } = useStickyHeader();

    const getHiddenColumns = () => {
        var cols = localStorage.getItem('hidden-cols');
        if (cols) {
            var all = JSON.parse(cols);
            if (!all.includes('sts'))
                all.push('sts');
            return all;
        }
        else return [];
    }

    const filterTypes = React.useMemo(
        () => ({
            fuzzyText: Filters.fuzzyTextFilterFn,
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true
                })
            },
        }),
        []
    )

    function filterGreaterThan(rows, id, filterValue) {
        return rows.filter(row => {
            const rowValue = row.values[id];
            return rowValue >= filterValue;
        })
    }

    filterGreaterThan.autoRemove = val => typeof val !== 'number';

    const handleCellClick = (e, row) => {
        if (row.column.id === 'analysiscomment' && local_state.is_in_edit_mode) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (row.column.id === 'details' && local_state.is_in_edit_mode) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    const checkIsEditAllowed = (user) => {
        var result = false;
        try {
            if (user !== undefined && user !== null && user.roles != undefined && user.roles.length > 0) {
                var editAllowed = user.roles.filter(f => f.name === 'Administrators');
                if (editAllowed && editAllowed.length) {
                    result = editAllowed.length > 0;
                }
                //result = user.signInUserSession.accessToken.payload["cognito:groups"].includes('AnalysisCommentEditAllowed');
            }
        }
        catch { }

        return result;
    }

    const defaultColumn = React.useMemo(
        () => ({
            Filter: Filters.DefaultColumnFilter,
            //Cell: EditableCell,
        }),
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        allColumns,
        getToggleHideAllColumnsProps,
        getToggleRowSelectedProps,
        selectedFlatRows,
        state,
        initialState,
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
        //globalFilter
    } = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                sortBy: [
                    {
                        id: 'startdatetime',
                        desc: true
                    }
                ],
                hiddenColumns: getHiddenColumns(),
            },
            defaultColumn,
            filterTypes,
            autoResetPage: false,
            autoResetSelectedRows: false,
            //disableMultiSort: true,
            useFilters,
            useGlobalFilter
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
    )

    const handleAdvancedFilterClick = () => {
        showCustomFilters(true);
    }

    const handleSeqRunDownloadClick = (event, done) => {
        try {
            var csv = [];
            var csvColumnsAccessors = [];
            columns.forEach(m => {
                csvColumnsAccessors.push(...m.columns.map(item => item.accessor));
                csv.push([...m.columns.map(item => item.Header)]);
            });
            csv = [csv.flat()];
            data.map(m => {
                var result = csvColumnsAccessors.map(item => {
                    if (item === 'runstatus') {
                        return m[item][item];
                    }

                    if (item === 'rlq25') {
                        return m[item].split(':')[0];
                    }

                    if (item === 'ber80_200') {
                        return m[item]['value_raw'].split(':')[0];
                    }
                    return m[item];
                });
                csv.push(result);
            });
            dispatch(setRunListDownloadData(csv));
            done(true);
        }
        catch { }
    }

    const handleShowNumFlows100 = () => {
        dispatch(setIsAllRunListDataShown(!local_state.is_all_run_list_data_shown));
        dispatch(setIsRunDataLoading(true));
        !local_state.is_all_run_list_data_shown ? dispatch(getRunDataAllAsync(undefined)) : dispatch(getRunDataAllAsync(100));
    }

    const handleManageTableClick = () => {
        showManageColumns(true);
    }

    return (
        <div className="tableContainer">
            <Row style={{ maxWidth: '99%', marginLeft: 15, }}>
                <Col lg={3}>
                    <Filters.GlobalFilterMain preGlobalFilteredRows={preGlobalFilteredRows} globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} gotoPage={gotoPage} />
                </Col>
                <Col lg={2}>
                    <CustomFilter show={isCustomFiltersShowing} handleCloseModal={() => showCustomFilters(false)} data={data} />
                    <ManageColumns show={isManageColumnsShowing} handleCloseModal={() => showManageColumns(false)} getToggleHideAllColumnsProps={getToggleHideAllColumnsProps} allColumns={allColumns} visibleColumns={visibleColumns} localStorageFileName='hidden-cols' />
                    <Button className="advanced-filter-btn" color="primary" size="large" startIcon={<Badge badgeContent={local_state.number_of_custom_filters_applied} title={local_state.number_of_custom_filters_applied !== 0 ? `${local_state.number_of_custom_filters_applied} filter(-s) applied` : 'No filters applied'}
                        color="success">{!local_state.is_custom_filters_applied ? <FilterAltOffIcon /> : <FilterAltIcon />}</Badge>} onClick={handleAdvancedFilterClick} style={{ height: '93%', width: '70%', color: 'white', float: 'left', boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>
                        Advanced Filter
                    </Button>
                </Col>
                <Col lg={7}>
                    <Button className="advanced-filter-btn" color="primary" size="large" startIcon={<DownloadIcon />} style={{ height: '93%', width: '20%', color: 'white', float: 'right', boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>
                        <CSVLink asyncOnClick={true} filename={`nexus-main-table-data.csv`} data={local_state.runlist_download_data} onClick={handleSeqRunDownloadClick} style={{ color: 'white', textDecoration: 'none', }}>
                            Download
                        </CSVLink>
                    </Button>
                    <Button className="advanced-filter-btn" color="primary" size="large" startIcon={<ViewListIcon />} style={{ height: '93%', width: '20%', color: 'white', float: 'right', marginRight: 10, boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }} onClick={handleManageTableClick}>Manage</Button>
                    <IconButton title={local_state.is_all_run_list_data_shown ? 'All sequencing runs are shown' : 'Only sequencing runs with number of flows >= 100 are shown'} onClick={handleShowNumFlows100}
                        style={{ float: 'right', marginRight: 30, marginTop: 5, border: "2px solid #003049", boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>
                        {local_state.is_all_run_list_data_shown ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                </Col>
            </Row>
            {isSticky &&
                (<Container style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    maxWidth: '3000px',
                    zIndex: 100,
                }}>
                    <MaUTable {...getTableProps()} style={{ width: '100%' }}>
                        <TableHead style={{boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>
                            {headerGroups.map(headerGroup => (
                                <TableRow {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <TableCell width={column.minWidth} {...column.getHeaderProps(column.getSortByToggleProps(), {
                                            style: { minWidth: column.columns !== undefined && column.columns.filter(f => f.Header === column.Header).length > 0 ? column.columns.filter(f => f.Header === column.Header)[0].minWidthHeader : column.minWidth },
                                        })} align="center">
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted
                                                    ? column.isSortedDesc
                                                        ? <ExpandMoreIcon />
                                                        : <ExpandLessIcon />
                                                    : ''}
                                            </span>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHead>
                        {selectedRowIndex != -1 && isStickyRow ?
                            <TableBody>
                                {page.map((row, i) => {
                                    if (row.original.runid === local_state.runId && selectedRowIndex != -1) {
                                        prepareRow(row)
                                        return (
                                            <TableRow {...row.getRowProps()} className='row-active' style={{ height: 50, boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>
                                                {row.cells.map(cell => {
                                                    return (
                                                        <TableCell {...cell.getCellProps()} 
                                            style={{ width: cell.column.width, minWidth: cell.column.minWidth, textAlign: 'center', alignContent: 'center' }}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        )
                                    }
                                })}
                            </TableBody> : null}
                    </MaUTable>
                </Container>)}
            <Container style={{
                //position: "fixed",
                //top: 0,
                //left: 0,
                // right: 0,
                margin: 0,
                padding: 0,
                maxWidth: '3000px'
                //width: '100%',
                //zIndex: 100,
            }}>
                <MaUTable {...getTableProps()} ref={tableRef} style={{ width: '100%' }} >
                    <TableHead style={{ boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>
                        {headerGroups.map(headerGroup => (
                            <TableRow {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <TableCell {...column.getHeaderProps(column.getSortByToggleProps(), {
                                        style: { minWidth: column.minWidth, width: column.width },
                                    })} align="center">
                                        {column.render('Header')}
                                        <span>
                                            {column.isSorted
                                                ? column.isSortedDesc
                                                    ? <ExpandMoreIcon />
                                                    : <ExpandLessIcon />
                                                : ''}
                                        </span>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody >
                        {page.map((row, i) => {
                            prepareRow(row);
                            return (
                                <TableRow {...row.getRowProps()} onClick={(e) => handleRowClick(e, row, row.index, selectedFlatRows)} className={`${selectedRowIndex === row.index ? "row-active" : "not-row-active"}`} style={{ cursor: 'pointer' }}>
                                    {row.cells.map(cell => {
                                        return (
                                            <TableCell {...cell.getCellProps()} 
                                            style={{ width: cell.column.width, minWidth: cell.column.minWidth, textAlign: 'center', alignContent: 'center' }} onClick={(e) => handleCellClick(e, cell)}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </MaUTable>
            </Container>
            <Row className="text-center" style={{ alignItems: 'center', marginTop: 20 }}>
                <Col lg={12}>
                    <div>
                        <Button className="advanced-filter-btn" variant="contained" onClick={() => gotoPage(0)} disabled={!canPreviousPage} style={{ width: '200px', marginTop: 7, height: 40, boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>{'<<'}</Button>{' '}
                        <Button className="advanced-filter-btn" variant="contained" onClick={() => previousPage()} disabled={!canPreviousPage} style={{ width: '200px', marginTop: 7, height: 40, boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>{'<'}</Button>{' '}
                        <span style={{ verticalAlign: 'middle' }}>
                            Page{' '}
                            <strong>
                                {state.pageIndex + 1} of {pageOptions.length}
                            </strong>{' '}
                        </span>
                        <TextField size="small" id="outlined-basic" label="Go to Page" variant="outlined" inputProps={{ type: 'number', style: { textAlign: 'center', height: 23 }, }} defaultValue={state.pageIndex + 1} style={{ width: 120, marginTop: 8, }} onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            gotoPage(page)
                        }} />
                        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                            <InputLabel id="demo-select-small">Page Size</InputLabel>
                            <Select
                                labelId="demo-select-small"
                                id="demo-select-small"
                                value={state.pageSize}
                                label="Page Size"
                                onChange={e => {
                                    setPageSize(Number(e.target.value))
                                }}
                                size="small"
                            >
                                <MenuItem value={10}>Show 10</MenuItem>
                                <MenuItem value={20}>Show 20</MenuItem>
                                <MenuItem value={30}>Show 30</MenuItem>
                                <MenuItem value={40}>Show 40</MenuItem>
                                <MenuItem value={50}>Show 50</MenuItem>
                            </Select>
                        </FormControl>
                        <Button className="advanced-filter-btn" variant="contained" onClick={() => nextPage()} disabled={!canNextPage} style={{ width: '200px', marginTop: 7, height: 40, boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>{'>'}</Button>{' '}
                        <Button className="advanced-filter-btn" variant="contained" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} style={{ width: '200px', marginTop: 7, height: 40, boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)' }}>{'>>'}</Button>{' '}
                    </div>
                </Col>
            </Row>
        </div>
    )
}

const RenderTable = (props) => {
    const state = useSelector(state => state);
    const dispatch = useDispatch();

    const { mainTableData, handleTabsSelect, handleClearAdvancedSearch } = props;
    const [selectedRowIndex, setSelectedRowIndex] = React.useState(-1);

    let editRef = useRef(null);

    const handleRowClick = (e, data, index, selectedRows) => {
        try {
            e.stopPropagation();
            e.preventDefault();
            setSelectedRowIndex(index);
            dispatch(setRunId(data.original.runid));
            dispatch(setInstrumentId(data.original.sysid));
        }
        catch (e) {
            //console.log(e);
        }
    };

    useEffect(() => {
        if (state.runId != null) {
            handleTabsSelect(state.active_tab_name);
        }
    }, [state.runId]);

    const getRLQ25Row = rlq25 => {
        try {
            if (rlq25 != null && rlq25 != "undefined" && rlq25 != "" && rlq25 != undefined && rlq25 != null  && !rlq25.includes('null')) {
                var rawTemp = rlq25.toString().split(':');
                var colorCls = '';
                if (rawTemp.length >= 2) {
                    if (rawTemp[1] == "y")
                        colorCls = 'text-dark-orange';
                }
                var v = rawTemp[0] != null && rawTemp[0] != undefined && rawTemp[0] != "null" && rawTemp[0] != "" && rawTemp[0] != 'inf' ? parseInt(rawTemp[0]) : rawTemp[0];
                return <div className={`text-center ${colorCls}`} title="RLQ25 (bp)">{v}</div>;
            }
            else return <div className="text-center">{''}</div>;
        }
        catch {
            return <div className="text-center">{''}</div>;
        }
    }

    const getRefBeadsSignalRow = refbeadssig => {       
        try {            
            if (refbeadssig != null && refbeadssig != "undefined" && refbeadssig != undefined && refbeadssig != "" && refbeadssig != "null") {
                var rawTemp = refbeadssig.toString().split(':');               
                //return <div className={`text-center ${colorCls}`} style={{ verticalAlign: 'middle' }}>{refbeadssig != null && refbeadssig != "undefined" && refbeadssig != undefined && refbeadssig != "" && refbeadssig != "null" ? Utils.addCommas(rawTemp[0]) : ''}</div>;
                return <div className={`text-center`} style={{ verticalAlign: 'middle' }}>{refbeadssig != null && refbeadssig != "undefined" && refbeadssig != undefined && refbeadssig != "" && refbeadssig != "null" ? rawTemp[0].split('.')[0] : ''}</div>;
            }
            else return <div className={`text-center`} style={{ verticalAlign: 'middle' }}>{''}</div>;
        }
        catch {
            return <div className={`text-center`} style={{ verticalAlign: 'middle' }}>{''}</div>;
        }
    }

    const getAnalysisStatus = (v) => {
        try {
            if (v != null && v != "undefined" && v != undefined && v != "") {
                if (v.length > 0 && !isNaN(v)) {
                    var status = v.toString();
                    var templateClass = Utils.getAlertClass(status[0]);
                    var basecallingClass = Utils.getAlertClass(status[1]);
                    var chemistryClass = Utils.getAlertClass(status[2]);
                    var qcAnalysisClass = Utils.getAlertClass(status[3]);
                    return (
                        <span className="text-center" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <span title={`Template report ${Utils.getTitleMessage(status[0])}`} className={`alert_status template_circle ${templateClass}`} style={{ float: 'left', }}>
                                {status[0] == 2 && <svg style={{ marginTop: 2 }} width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.615234 3.8L4.70614 7L10.6146 1" stroke="white" strokeWidth="2" />
                                </svg>}
                            </span>
                            <span title={`Library analysis pipeline ${Utils.getTitleMessage(status[1])}`} className={`alert_status ${basecallingClass}`} style={{ marginLeft: '6px', float: 'left', }}>
                                {status[1] == 2 && <svg style={{ marginTop: 2 }} width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.615234 3.8L4.70614 7L10.6146 1" stroke="white" strokeWidth="2" />
                                </svg>}
                            </span>
                            <span title={`Upload ${Utils.getTitleMessage(status[2])}`} className={`alert_status ${chemistryClass}`} style={{ marginLeft: 5, float: 'left', }}>
                                {status[2] == 2 && <svg style={{ marginTop: 2 }} width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.615234 3.8L4.70614 7L10.6146 1" stroke="white" strokeWidth="2" />
                                </svg>}
                            </span>
                            <span title={`QC analysis ${Utils.getTitleMessage(status[3])}`} className={`alert_status template_circle ${qcAnalysisClass}`} style={{ display: 'inline-block', marginLeft: 5, float: 'left', }}>
                                {status[3] == 2 && <svg style={{ marginTop: 2 }} width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.615234 3.8L4.70614 7L10.6146 1" stroke="white" strokeWidth="2" />
                                </svg>}
                            </span>
                        </span>
                    );

                }
                else {
                    return <td className="text-center">N/A</td>;
                }

            }
            else if (v == null) {
                v = "0000";
                var status = v.toString();
                var templateClass = Utils.getAlertClass(status[0]);
                var basecallingClass = Utils.getAlertClass(status[1]);
                var chemistryClass = Utils.getAlertClass(status[2]);
                var qcAnalysisClass = Utils.getAlertClass(status[3]);
                return (
                    <span className="" style={{ textAlign: 'center' }}>
                        <span title={`Template report ${Utils.getTitleMessage(status[0])}`} className={`alert_status template_circle ${templateClass}`} style={{ float: 'left', }}></span>
                        <span title={`Library analysis pipeline ${Utils.getTitleMessage(status[1])}`} className={`alert_status ${basecallingClass}`} style={{ marginLeft: 6, float: 'left', }}></span>
                        <span title={`Upload ${Utils.getTitleMessage(status[2])}`} className={`alert_status ${chemistryClass}`} style={{ marginLeft: 5, float: 'left', }}></span>
                        <span title={`QC analysis ${Utils.getTitleMessage(status[3])}`} className={`alert_status template_circle ${qcAnalysisClass}`} style={{ display: 'inline-block', marginLeft: 5, float: 'left', }}></span>
                    </span>);
            }
            else return <td className="text-center">{v}</td>;
        }
        catch {
            return <td className="text-center">{v}</td>;
        }
    }

    const getF95Row = f95 => {
        if (f95 != null && f95 != "undefined" && f95 != "" && f95 != 'inf' && f95 != Infinity && f95 != undefined) {
            var rawTemp = f95.toString().split(':');
            var colorCls = 'text-dark-orange';            
            var vv = rawTemp[0] != null && rawTemp[0] != undefined && rawTemp[0] != "null" && rawTemp[0] != "" && rawTemp[0] != 'nan' && rawTemp[0] != 'inf' && rawTemp[0] != "inf" ? rawTemp[0] : rawTemp[0] != 'nan' ? rawTemp[0] : '';
            return <div className={`text-center ${colorCls}`} style={{ verticalAlign: 'middle' }} title="F95 @30x">{vv}</div>;
        }
        else return <div className="text-center" style={{ verticalAlign: 'middle' }}>{''}</div>;
    }

    const setOrangeColor = value => {
        return <div className={`text-center text-dark-orange`} style={{ verticalAlign: 'middle' }}>{value}</div>;
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'Run Info',
                columns: [
                    {
                        Header: 'Start Date',
                        accessor: 'startdatetime',
                        //minWidth: 120,
                        //minWidthHeader: 125,
                        sortType: (a, b) => {
                            return new Date(a.values.startdatetime) - new Date(b.values.startdatetime);
                        },
                        //Cell: row => <div className='text-center'>{row.value}</div>
                        Cell: row => renderTableCell(row.value, 'startdatetime'),
                    },
                    {
                        Header: 'Sys Id',
                        accessor: 'sysid',
                        //minWidth: 130,
                        //minWidthHeader: 140,
                        Cell: row => renderTableCell(row.value, 'sysid'),
                    },
                    {
                        Header: 'Chuck',
                        accessor: 'chuck',
                        //minWidth: 70,
                        //minWidthHeader: 70,
                        Cell: row => renderTableCell(row.value, 'chuck'),
                    },
                    {
                        Header: 'Run Id',
                        accessor: 'runid',
                        //minWidth: 120,
                        //minWidthHeader: 120,
                        Cell: row => renderTableCell(row.value, 'runid'),
                    },
                    {
                        Header: 'Project',
                        accessor: 'project',
                        Cell: row => renderTableCell(row.value, 'project'),
                    },
                    {
                        Header: 'Details',
                        accessor: 'details',
                        minWidth: 270,
                        minWidthHeader: 270,
                        Cell: row => EditableCell(row, editRef),
                    },
                ],
            },
            {
                Header: 'Run Stats',
                columns: [
                    {
                        Header: 'Status',
                        accessor: 'runstatus',
                        Filter: Filters.NumberRangeColumnFilter,
                        filter: 'between',
                        Cell: row => renderTableCell(Utils.getRunStatus(row.value), 'runstatus'),
                    },
                    {
                        Header: 'Run Time',
                        accessor: 'runtime',
                        Cell: row => renderTableCell(row.value, 'runtime'),
                    },
                    {
                        Header: 'Num flows',
                        accessor: 'numflows',
                        Cell: row => renderTableCell(row.value, 'numflows'),
                    },
                    {
                        Header: 'Num beads (M)',
                        accessor: 'numbeads',
                        Cell: row => renderTableCell(row.value, 'numbeads'),
                    },
                    {
                        Header: 'Aligned Bases (TB)',
                        accessor: 'aligned_bases',
                        Cell: row => renderTableCell(setOrangeColor(row.value), 'aligned_bases'),
                    },
                    {
                        Header: 'Indel Rate (%)',
                        accessor: 'indel_rate',
                        Cell: row => renderTableCell(setOrangeColor(row.value), 'indel_rate'),
                    },
                ],
            },
            {
                Header: 'Signal',
                columns: [
                    /*{
                        Header: 'Ref Bead',
                        accessor: 'refbeadssig',
                        //Cell: row => getRefBeadsSignalRow(row.value),
                        Cell: row => renderTableCell(getRefBeadsSignalRow(row.value), 'refbeadssig'),
                    },*/
                    {
                        Header: 'First T sig/tile',
                        accessor: 'firsttsig',
                        //Cell: row => renderTableCell(getRefBeadsSignalRow(Utils.addCommas(row.value)), 'firsttsig'),
                        Cell: row => renderTableCell(getRefBeadsSignalRow(row.value), 'firsttsig'),
                    },
                ],
            },
            {
                Header: 'Quality Assessment',
                columns: [
                    {
                        Header: 'STS',
                        accessor: 'sts',
                        isHiddenByDefault: true,
                        Cell: row => renderTableCell(row.value, 'sts'),
                    },
                    {
                        Header: 'Lag',
                        accessor: 'lag',
                        Cell: row => renderTableCell(row.value, 'lag'),
                    },
                    {
                        Header: 'Lead',
                        accessor: 'lead',
                        Cell: row => renderTableCell(row.value, 'lead'),
                    },
                    {
                        Header: 'Droop',
                        accessor: 'droop',
                        Cell: row => renderTableCell(row.value, 'droop'),
                    },
                ],
            },
            {
                Header: 'Library Quality',
                columns: [
                    {
                        Header: 'Stat\'y Non-Unif',
                        accessor: 'nonunifcv',
                        Cell: row => renderTableCell(row.value, 'nonunifcv'),
                    },
                    {
                        Header: 'F95 @ 30x min',
                        accessor: 'f95_30x_min',
                        Cell: row => renderTableCell(getF95Row(row.value), 'f95_30x_min'),
                    },
                    {
                        Header: 'F95 @ 30x max',
                        accessor: 'f95_30x_max',
                        Cell: row => renderTableCell(getF95Row(row.value), 'f95_30x_max'),
                    },
                    {
                        Header: 'R80 (%)',
                        accessor: 'r80',
                        Cell: row => renderTableCell(row.value, 'r80'),
                    },
                    {
                        Header: 'RLQ25 (bp)',
                        accessor: 'rlq25',
                        Cell: row => renderTableCell(getRLQ25Row(row.value), 'rlq25'),
                    },
                    {
                        Header: 'Ber80 @200 (%)',
                        accessor: 'ber80_200',
                        Cell: row => renderTableCell(row.value.value, 'ber80_200'),
                    },
                    {
                        Header: 'Ber80 (%)',
                        accessor: 'ber80',
                        Cell: row => renderTableCell(row.value, 'ber80'),
                    },
                ],
            },
            {
                Header: 'Analysis',
                columns: [
                    {
                        Header: 'Analysis Status',
                        accessor: 'analysisstatus',
                        Cell: row => getAnalysisStatus(row.value),
                        minWidth: 120,
                        minWidthHeader: 120,
                    },
                    {
                        Header: 'Analysis Comment',
                        accessor: 'analysiscomment',
                        width: 210,
                        minWidth: 210,
                        minWidthHeader: 210,
                        //Cell: row => renderTableCell(row.value, 'analysiscomment'),
                        Cell: row => EditableCell(row, editRef),
                    },
                ],
            },
        ],
        [state.search_term, state.runlist, state.runlist_searched]
    )

    const getTitleText = text => {
        try {
            if (text !== undefined && (typeof text === 'string') || typeof text === 'number') {
                return text;
            }
            else if (text !== null && text !== undefined && text.props !== undefined && text.props.children !== undefined && text.props.children !== null) {
                return Array.isArray(text.props.children) ? text.props.children.join('') : text.props.children.toString();
            }
            else {
                return text;
            }
        }
        catch { }
    }

    const getClassName = (text, useOverflow) => {
        var classes = [(useOverflow != undefined && useOverflow === true) ? 'truncate-overflow' : undefined];

        try {
            if (text !== null && text !== undefined && text.props !== undefined && text.props.className !== undefined && text.props.className !== undefined) {
                classes.push(text.props.className);
            }
        }
        catch { }

        return classes.join('');
    }

    const renderTableCell = (value, columnName, useOverflow = false) => {
        try {
            if (state.search_term != undefined && state.search_term.length > 0 && state.search_term[0] !== undefined && value !== undefined) {
                var valueToHighlight = value;               
                if (columnName === 'runstatus' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined && value.props.children.props !== undefined && value.props.children.props.children !== undefined && value.props.children.props.children.length > 0) {
                    valueToHighlight = Array.isArray(value.props.children.props.children) ?value.props.children.props.children.join('') : value.props.children.props.children;
                }
                else if (columnName === 'refbeadssig' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined && value.props.children.length > 0) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children.split('.')[0];
                }
                else if (columnName === 'firsttsig' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children;
                }
                else if (columnName === 'f95' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined && value.props.children.length > 0) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children.split(',')[0];
                }
                else if (columnName === 'rlq25' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children;
                }
                else if (columnName === 'ber80_200' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined && value.props.children.length > 0) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children;
                }
                else if (columnName === 'indel_rate' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined && value.props.children.length > 0) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children;
                }
                else if (columnName === 'aligned_bases' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined && value.props.children.length > 0) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children;
                }
                else if (columnName === 'f95_30x_min' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children;
                }
                else if (columnName === 'f95_30x_max' && value !== null && value.props !== undefined && value.props !== null && value.props.children !== undefined) {
                    valueToHighlight = Array.isArray(value.props.children) ? value.props.children.join('') : value.props.children;
                }

                const chunks = findAll({
                    caseSensitive: false,
                    searchWords: state.search_term,
                    textToHighlight: valueToHighlight
                });

                if ((chunks !== undefined && chunks.length === 0) || valueToHighlight === null) {
                    return <div key={Utils.generateKey(99)} className={(useOverflow != undefined && useOverflow === true) ? 'truncate-overflow' : undefined} title={getTitleText(value)}>{value}</div>;
                }

                return chunks
                    .map((chunk, i) => {
                        const { end, highlight, start } = chunk;
                        const text = valueToHighlight.toString().substr(start, end - start);
                        if (highlight) {
                            return <span className={(useOverflow != undefined && useOverflow === true) ? 'truncate-overflow' : undefined} key={Utils.generateKey(i)} style={{ backgroundColor: 'green', boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)', }} title={getTitleText(text)}>{text}</span>;
                        } else {
                            return <span className={getClassName(value, useOverflow)} key={Utils.generateKey(i)} title={getTitleText(text)} >{text}</span>;
                        }
                    });
            }
            else return <div key={Utils.generateKey(99)} className={(useOverflow != undefined && useOverflow === true) ? 'truncate-overflow' : undefined} title={getTitleText(value)}>{value}</div>;
        }
        catch { }
    }

    return (
        <Table columns={columns} data={mainTableData} handleRowClick={handleRowClick} selectedRowIndex={selectedRowIndex} handleClearAdvancedSearch={handleClearAdvancedSearch} />
    );
}

const EditableCell = ({
    value: initialValue,
    row: { index, values },
    column: { id, Header },
}, ref) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState(initialValue);
    const [isInEditModeDetails, setEditModeDetails] = useState(false);
    const [isInEditModeAnalysisComments, setEditModeAnalysisComments] = useState(false);
    const [isEditAllowed, setEditAllowed] = useState(false);   

    const dispatch = useDispatch();

    useEffect(() => {
        if (state.user != undefined) {
            var editAllowed = checkIsEditAllowed(state.user);
            if (editAllowed) {
                setEditAllowed(true);
            }
            else setEditAllowed(false);
        }
    }, []);

    const state = useSelector(state => state);

    const onChange = e => {
        e.stopPropagation();
        e.preventDefault();       
        setValue(e.target.value);
    }

    const onBlur = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    const onClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]); 

    const handleEditClick = (e, runid) => {
        try {
            if (state.user !== undefined) {
                e.stopPropagation();
                e.preventDefault();

                ref.current = runid;

                var isEditAllowed = checkIsEditAllowed(state.user);
                if (Header === 'Details') {
                    dispatch(setEditMode(true));
                    dispatch(setDetailsDataSaved(false));
                    setEditModeDetails(isEditAllowed);
                }
                else if (Header === 'Analysis Comment') {
                    dispatch(setEditMode(true));
                    dispatch(setAnalysisCommentDataSaved(false));
                    setEditModeAnalysisComments(isEditAllowed);
                }
            }
        }
        catch { }
    }

    const checkIsEditAllowed = (user) => {
        var result = false;
        try {
            if (user !== undefined && user !== null && user.roles != undefined && user.roles.length > 0) {
                var editAllowed = user.roles.filter(f => f.name !== 'AnalysisCommentEditAllowed');
                if (editAllowed && editAllowed.length) {
                    result = editAllowed.length > 0;
                }
            }
        }
        catch { }

        return result;
    }

    const handleSaveClick = (e) => {
        try {
            if (Header === 'Details') {
                e.stopPropagation();
                e.preventDefault();
                dispatch(saveDetailsData(values.runid, { data: value }, state.runlist));
            }
            else if (Header === 'Analysis Comment') {
                e.stopPropagation();
                e.preventDefault();
                dispatch(saveAnalysisCommentData(values.runid, { data: value }, state.runlist));
            }
        }
        catch { }
    } 

    const getTitleText = text => {
        try {
            if (text !== undefined && (typeof text === 'string') || typeof text === 'number') {
                return text;
            }
            else if (text !== null && text !== undefined && text.props !== undefined && text.props.children !== undefined && text.props.children !== null) {
                return Array.isArray(text.props.children) ? text.props.children.join('') : text.props.children.toString();;
            }
            else {
                return text;
            }
        }
        catch { }
    }

    if (state.search_term != undefined && state.search_term.length > 0 && state.search_term[0] !== undefined && value !== undefined && !state.is_in_edit_mode) {
        var valueToHighlight = value;

        /*if (!valueToHighlight) {
            return <span key={Utils.generateKey(8)} title={getTitleText(value)}>{value}</span>
        }*/

        const chunks = findAll({
            caseSensitive: false,
            searchWords: state.search_term,
            textToHighlight: valueToHighlight
        });

        var chunksAll = chunks
            .map((chunk, i) => {
                const { end, highlight, start } = chunk;
                if (!valueToHighlight) return <span key={Utils.generateKey(i)} title={getTitleText(value)}>{value}</span>
                const text = valueToHighlight.toString().substr(start, end - start);
                if (highlight) {
                    //return <span className={(useOverflow != undefined && useOverflow === true) ? 'truncate-overflow' : undefined} key={Utils.generateKey(i)} style={{ backgroundColor: 'green', boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)', }} title={getTitleText(text)} >{text}</span>;
                    return <span key={Utils.generateKey(i)} style={{ width: '100%', backgroundColor: 'green', boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)', }} title={getTitleText(text)}>{text}</span>
                } else {
                    //return <span className={(useOverflow != undefined && useOverflow === true) ? 'truncate-overflow' : undefined} key={Utils.generateKey(i)} title={getTitleText(text)} >{text}</span>;
                    return <span key={Utils.generateKey(i)} title={getTitleText(text)}>{text}</span>
                }
            });

        var wrapper = (data) => {
            return (isInEditModeAnalysisComments && !state.is_analysis_comments_data_saved && state.is_in_edit_mode) || (isInEditModeDetails && !state.is_details_data_saved && state.is_in_edit_mode) ?
                <div className='row' key={Utils.generateKey(1)}>
                    <div className={Header === 'Analysis Comment' ? 'col-lg-10' : 'col-lg-11'}>
                        <TextField placeholder="Click to edit" multiline rows={2} maxRows={4} value={data === null ? undefined : data} onChange={onChange} onClick={onClick} onBlur={onBlur} style={{ width: '100%' }} />
                    </div>
                    <div className="col-lg-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(isInEditModeDetails || isInEditModeAnalysisComments) ?
                            <Tooltip title='Click to Save'>
                                <span>
                                    <IconButton onClick={handleSaveClick} style={{ float: 'right', verticalAlign: 'middle' }}>
                                        <SaveIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            :
                            <Tooltip title='Click to Edit'>
                                <span>
                                    <IconButton onClick={(e) => handleEditClick(e, values.runid)} style={{ float: 'right', verticalAlign: 'middle', }}>
                                        <EditIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        }
                    </div>
                </div>
                :
                isEditAllowed ?
                    <div className='row' key={Utils.generateKey(1)}>
                        <div className={Header === 'Analysis Comment' ? 'col-lg-10' : 'col-lg-11'} >
                            {data.map(m => m)}
                        </div>
                        <div className="col-lg-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tooltip title='Click to Edit'>
                                <span>
                                    <IconButton onClick={(e) => handleEditClick(e, values.runid)} style={{ float: 'right', verticalAlign: 'middle' }} disabled={/* isEditAllowed === false */ state.is_in_edit_mode}>
                                        <EditIcon style={{ float: 'right', verticalAlign: 'middle' }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                    :
                    <React.Fragment>{data.map(m => m)}</React.Fragment>
        }

        return wrapper(chunksAll);
    }
    else
        return (isInEditModeAnalysisComments && !state.is_analysis_comments_data_saved && state.is_in_edit_mode && (ref.current === values.runid || ref.current === null)) || (isInEditModeDetails && !state.is_details_data_saved && state.is_in_edit_mode && (ref.current === values.runid || ref.current === null)) ?
            <div className='row'>
                <div className={Header === 'Analysis Comment' ? 'col-lg-10' : 'col-lg-11'}>
                    <TextField placeholder="Click to edit" multiline rows={2} maxRows={4} value={value === null ? undefined : value} onChange={onChange} onClick={onClick} onBlur={onBlur} style={{ width: '100%' }} />
                </div>
                <div className="col-lg-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(isInEditModeDetails || isInEditModeAnalysisComments) ?
                        <Tooltip title='Click to Save'>
                            <span>
                                <IconButton onClick={handleSaveClick} style={{ float: 'right', verticalAlign: 'middle' }}>
                                    <SaveIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        :
                        <Tooltip title='Click to Edit'>
                            <span>
                                <IconButton onClick={(e) => handleEditClick(e, values.runid)} style={{ float: 'right', verticalAlign: 'middle', }}>
                                    <EditIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    }
                </div>
            </div>
            :
            isEditAllowed ?
                <div className='row'>
                    <div className={Header === 'Analysis Comment' ? 'col-lg-10' : 'col-lg-11'} >
                        <span style={{ width: '100%' }} className={Header === 'Details' || Header === 'Analysis Comment' ? 'truncate-overflow' : undefined} title={getTitleText(value)}>{value}</span>
                    </div>
                    <div className="col-lg-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tooltip title='Click to Edit'>
                            <span>
                                <IconButton onClick={(e) => handleEditClick(e, values.runid)} style={{ float: 'right', verticalAlign: 'middle' }} disabled={/* isEditAllowed === false */ state.is_in_edit_mode}>
                                    <EditIcon style={{ float: 'right', verticalAlign: 'middle' }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                </div>
                :
                <span style={{ width: '100%' }} className={Header === 'Details' || Header === 'Analysis Comment' ? 'truncate-overflow' : undefined} title={getTitleText(value)}>{value}</span>
}

export default RenderTable;