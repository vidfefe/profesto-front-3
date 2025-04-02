import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root {
    --white: #fff;
    --black: #000;
    --meddium-green: #C3E1D2;
    --meddium-orange: #FFE4C8;
    --light-green: #EAF5EB;
    --success-green: #77B448;
    --green: #339966;
    --red: #C54343;
    --dark-green: #1F6B45;
    --dark-gray: #676767;
    --light-gray: #F2F2F4;
    --gray: #F8F8F8;
    --footer-dark: #00101A;
    --orange: #FF9933;
    --pink: #FDEDEE;
    --light-red: #F46A6A;
    --light-orange: #FCF2E4;
    --header-dark:  #172B37;
    --facebook: #2867b2;
    --light-purple: #F0F0F9;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    vertical-align: baseline;
    font: inherit;
  }
  
  .grecaptcha-badge { visibility: hidden; }

  /*** main styles **/
  html,
  body {
    height: 100%;
    font-size: 12px; 
    font-family: 'Aspira Regular', 'FiraGO Regular', Helvetica, sans-serif;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  img {
    max-width: 100%;
    display: inline-block;
  }
  ul {
    list-style: none;
  }
  input,
  button{
    outline: none;
  }
  h4 {
    font-family: 'Aspira Regular', 'FiraGO Regular', Helvetica, sans-serif;
  }
  table {
    width: auto;
    display: table;
    border-collapse: collapse;
    border-spacing: 0;
  }

  .w-100{
    width: 100%;
  }

  .h-100{
    height: 100%;
  }

  .rotated{
    transform: rotate(180deg);
  }

  .text-center{
    text-align: center
  }

  .btn{
    display: block;
    border-radius: 4px;
    padding: 10px;
    border: none;
    outline: none !important;
    transition: background 0.25s;
    cursor: pointer;
  }

  .btn-green{
    background: var(--green);
    color: #fff;

    &:hover{
      background: var(--dark-green);
    }
  }

  textarea {
    font-family: 'Aspira Regular', 'FiraGO Regular', Helvetica, Helvetica, sans-serif;
  }

  /** Flex Classes **/
  .d-flex{
    display: flex !important;
  }

  .justify-content-center{
    justify-content: center !important;
  }

  .align-items-center{
    align-items: center !important;
  }

  .error-overlay-list{
    list-style-type: circle;
    padding-left: 20px;
  }

  .loading-indicator{
    min-height: 30px;
    margin-top: -3px;
    circle{
      stroke: var(--green)
    }
  }
  .MuiTableContainer-root {
    overflow-x: hidden;
  }
  .MuiTable-root {
        margin: 0px 10px 20px 10px;
        width: auto;
        overflow-x: hidden;
        & > thead {
              tr {
                  th {
                      border-bottom: 1px solid #F8F8F8;
                      font-size: 12px;
                      font-family: 'Aspira Wide Demi', 'FiraGO Medium';
                      padding: 20px 8px 10px 8px;
                  }
                  .non-padding-left {
                    padding: 20px 16px 10px 30px;
                  }
              }
          }
          & > tbody {
              tr {
                  td {
                      padding: 13px 8px;
                      font-size: 11px;
                      color: #414141;
                      & > span {
                          font-size: 11px;
                          color: #414141;
                      }
                  }

                  .dot{
                    width: 8px;
                    height: 8px;
                    margin-right: 5px;
                    border-radius: 50%;
                    display: inline-block;
                  }

                  .past{
                    opacity: 0.7;
                    .dot{
                      background: var(--dark-gray);
                    }
                  }

                  .future{
                    .dot{
                      background: var(--orange);
                    }
                  }

                  .current{

                    .dot{
                      background: var(--green);
                    }
                  }
              }
          }
   }
  .action-block {
        visibility: hidden;
        width: 50px;
    }
    .MuiTableRow-hover {
        &:hover {
            .action-block {
                visibility: visible;
                width: 50px;
            }
        }
    }
    .MuiTableCell-body {
        border-bottom: 1px solid #F8F8F8;
    }
    .rec-carousel {
      position: relative;
    }

`;

export default GlobalStyles;