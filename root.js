.MuiTableHead-root {
  /* background: -webkit-gradient(linear, left top, left bottom, from(#189AB4), to(#006096)); */
  /* background: -webkit-gradient(linear, left top, left bottom, from(#0075a9), to(#08176b)); */
  background: -webkit-gradient(linear, left top, left bottom, from(#0075a9), to(#003049));
  color: white;
  border-spacing: 0;
  border: 1px solid #ededed;
}

.MuiTableRow-root.MuiTableRow-head {
  border-spacing: 0;
  border: 1px solid #ededed;
}

.MuiTableRow-root.MuiTableRow-head th {
  text-align: center;
  border: 1px solid #ededed;
  color: white;
  font-size: 14px;
  font-weight: 700;
}

.row-active {
  background-color: #D9E7F4 !important;
  border-left: 3pt solid #08176b !important;
  border-right: 3pt solid #08176b !important;
}

.not-row-active {
  background-color: white !important;
  border: none !important;
}

.advanced-filter-btn {
  background: -webkit-gradient(linear, left top, right bottom, from(#0075a9), to(#003049));
}

.advanced-filter-btn:disabled,
.advanced-filter-btn[disabled] {
  border: 1px solid #999999 !important;
  background-color: #cccccc !important;
  color: #666666 !important;
  background: fixed;
}

/* 
.tableContainer {    
    border-radius: 20px;
    height: 1000px;
    padding: 0 10px 10px 10px;
    overflow: scroll;
} */

/* .tableContainer {    
    height: 1000px;    
    overflow-x: scroll;
  }   */

.truncate-overflow {
  display: -webkit-box;

  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.badge {
  padding: 1px 9px 2px;
  font-size: 12.025px;
  font-weight: bold;
  white-space: nowrap;
  color: #ffffff;
  background-color: #70b9c5;
  -webkit-border-radius: 9px;
  -moz-border-radius: 9px;
  border-radius: 9px;
  width: 45px;
}

.badge:hover {
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
}

.badge-error {
  background-color: #b94a48;
}

.badge-error:hover {
  background-color: #953b39;
}

.badge-warning {
  background-color: #f89406;
}

.badge-warning:hover {
  background-color: #c67605;
}

.badge-success {
  background-color: #5cc45e;
}

.badge-success:hover {
  background-color: #356635;
}

.badge-info {
  background-color: #3a87ad;
}

.badge-info:hover {
  background-color: #2d6987;
}

.badge-inverse {
  background-color: #333333;
}

.badge-inverse:hover {
  background-color: #1a1a1a;
}

@media screen and (min-width:1280px) and (max-width:1920px) {
  /* .MuiTableCell-root {
   padding: 10px !important;
   font-size: 8px !important;
  } */

  /* #stickeHeaderContainer {    
    max-width: 1920px !important;
  } */

  /* .MuiTable-root{
    width: 1440px !important;
  }

  .MuiTableBody-root{
    width: 1440px !important;
  }

  .MuiTableContainer-root{
    width: 1440px !important;
  } */

}

@media screen and (min-width: 3000px) {
  #stickeHeaderContainer {    
    left: 27px !important;
  }
}

@media screen and (min-width: 600px) and (max-width: 3000px) {
  #stickeHeaderContainer {    
    left: 14px !important;
  }
}