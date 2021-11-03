import { filter } from 'lodash';
import { forwardRef, useEffect, useState } from 'react';
// material
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  Button
} from '@mui/material';
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
import configData from "../config.json";
import { fetchUtils } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DialogTitle from '@mui/material/DialogTitle';
import SelecetCompany from './SelecetCompany';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const TABLE_HEAD = [
  { id: 'Id', label: 'ID', alignRight: false },
  { id: 'siteurl', label: 'Site Url', alignRight: false },
  { id: 'siteurls', label: 'Site Urls', alignRight: false },
  { id: 'companyname', label: 'Company Name', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  // { id: 'status', label: 'Status', alignRight: false },
  { id: '' }
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.siteurl.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function SelectSite({reload}) {
  // eslint-disable-next-line
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('siteurl');
  const [filterName, setFilterName] = useState('');
  // eslint-disable-next-line
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sites, setsites] = useState([]);
  const [AlertMessage, setAlertMessage] = useState("success");
  const [AlertType, setAlertType] = useState("success");
  const [AlertOpen, setAlertOpen] = useState(false);
  const [opensite, setopensite] = useState(false);
  const [opencompany, setopencompany] = useState(false);
  const handleOpenSelect = (params) => {
    setopensite(true);
  }
  const handleClose = () => {
    setopensite(false);
    setopencompany(false);

  };

  const AlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };
  const dialogCompany = (params) => {
    setopencompany(true);
    // ()
  }

  const httpClient = (url, options = {}) => {
    if (!options.headers) {
      options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = JSON.parse(sessionStorage.AccessToken).Token;
    options.headers.set('Authorization', `${token}`);
    return fetchUtils.fetchJson(url, options);
  };
  const dataProvider = jsonServerProvider(configData.API_URL + 'api', httpClient);
  // const MainUserId = JSON.parse(sessionStorage.AccessToken).UserId
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = sites.map((n) => n.Id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const manage = (Id) => {
    // if (selected.length > 1) {
    //   setAlertMessage("Please select one company!");
    //   setAlertType("error");
    //   setAlertOpen(true);
    // }
    // else if (selected.length === 0) {
    //   setAlertMessage("Please select one company!");
    //   setAlertType("error");
    //   setAlertOpen(true);
    // }
    // else {
    setAlertMessage("The site is selected!");
    setAlertType("success");
    setAlertOpen(true);
    let name = "";
    for (let i = 0; i < sites.length; i++) {
      if (sites[i].Id === Id) {
        name = sites[i].siteurl;
      }
    }
    sessionStorage.CurrentSite = JSON.stringify({ id: Id, name: name })
    handleClose();
    // }
  }


  // const handleClick = (event, Id) => {
  //   const selectedIndex = selected.indexOf(Id);
  //   let newSelected = [];
  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, Id);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(
  //       selected.slice(0, selectedIndex),
  //       selected.slice(selectedIndex + 1)
  //     );
  //   }
  //   setSelected(newSelected);
  // };

  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sites.length) : 0;

  const filteredUsers = applySortFilter(sites, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  const loadData = (params) => {
    if (sessionStorage.CurrentCompany) {
      console.log(JSON.parse(sessionStorage.CurrentCompany).id, 12)
      dataProvider.getList("company_sites", { pagination: { page: 1, perPage: 10 }, sort: { field: 'url', order: 'ASC' }, filter: { CompanyId: JSON.parse(sessionStorage.CurrentCompany).id } })
        .then(res => {
          const data = res.data;
          const res_data = [];
          for (let i = 0; i < data.length; i++) {
            if (data[i].CompanyId === JSON.parse(sessionStorage.CurrentCompany).id) {
              res_data.push({
                Id: data[i].id,
                siteurl: data[i].Url,
                siteurls: data[i].Urls,
                companyname: JSON.parse(sessionStorage.CurrentCompany).name,
                date: data[i].CreatedAt,
              })
            }
          }
          if (res_data.length === 0) {
            sessionStorage.CurrentSite = JSON.stringify({ id: "", name: "No Select" })
            setAlertMessage("Please create New Company");
            setAlertType("info");
            setAlertOpen(true);
          }
          else if (params === "default") {
            sessionStorage.CurrentSite = JSON.stringify({ id: res_data[0].Id, name: res_data[0].siteurl })
          }
          else if (res_data.length === 1) {
            sessionStorage.CurrentSite = JSON.stringify({ id: res_data[0].Id, name: res_data[0].siteurl })
          }
          setsites(res_data);
          reload();
        })
      }
      else {
      setAlertMessage("Please Select Company");
      setAlertType("info");
      setAlertOpen(true);
    }
  }
  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Sites
      </Typography>
      <Typography variant="h7" gutterBottom>
        Current Company : {sessionStorage.CurrentCompany ? JSON.parse(sessionStorage.CurrentCompany).name : "No selected"}
      </Typography>
      <Typography variant="h7" gutterBottom>
        Current Site : {sessionStorage.CurrentSite ? JSON.parse(sessionStorage.CurrentSite).name : "No selected"}
      </Typography>
      <Button
        variant="contained"
        onClick={(e) => dialogCompany()}
        startIcon={<CheckBoxIcon />}
        color="secondary"
      >
        Select Company
      </Button>

      <Dialog open={opencompany} onClose={handleClose} fullWidth={true} maxWidth="md">
        <DialogTitle>Please select Company</DialogTitle>
        <DialogContent>
          <SelecetCompany handleOpenSelect={handleClose} load = {loadData}/>
        </DialogContent>
      </Dialog>
      <Button
        variant="contained"
        onClick={(e) => handleOpenSelect()}
        startIcon={<CheckBoxIcon />}
        color="secondary"
      >
        Select Site
      </Button>



      <Dialog open={opensite} onClose={handleClose} fullWidth={true} maxWidth="md">
        <DialogTitle>Please select Site</DialogTitle>
        <DialogContent>
          <Page title="Sites | Holest">
            <Snackbar open={AlertOpen} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "right" }} onClose={AlertClose}>
              <Alert onClose={AlertClose} severity={AlertType} sx={{ width: '100%' }}>
                {AlertMessage}
              </Alert>
            </Snackbar>
            <Container>
              <Card style={{ boxShadow: "none" }}>
                <UserListToolbar
                  numSelected={selected.length}
                  filterName={filterName}
                  onFilterName={handleFilterByName}
                />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={sites.length}
                        numSelected={selected.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />
                      <TableBody>
                        {filteredUsers
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((row, key) => {
                            const { Id, siteurl, siteurls, companyname, date } = row;
                            const isItemSelected = selected.indexOf(Id) !== -1;

                            return (
                              <TableRow
                                hover
                                key={key}
                                tabIndex={-1}
                                role="checkbox"
                                onClick={(e) => manage(Id)}
                                selected={isItemSelected}
                                aria-checked={isItemSelected}
                              >
                                {/* <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleClick(event, Id)}
                            />
                          </TableCell> */}
                                <TableCell align="left">{Id}</TableCell>
                                <TableCell component="th" scope="row" padding="none">
                                  <Typography variant="subtitle2" noWrap>
                                    {siteurl}
                                  </Typography>
                                </TableCell>
                                <TableCell align="left">{siteurls}</TableCell>
                                <TableCell align="left">{companyname}</TableCell>
                                <TableCell align="left">{date}</TableCell>
                                <TableCell align="right">
                                  <UserMoreMenu />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {isUserNotFound && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <SearchNotFound searchQuery={filterName} />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </Scrollbar>
                {/* <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }} paddingLeft={4} style={{ display: 'flex', justifyContent: 'space-between' }}>

            <Button onClick={(e) => manage()}>Manage</Button>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sites.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Stack> */}
              </Card>
            </Container>
          </Page>
        </DialogContent>
      </Dialog>

    </>
  );
}
