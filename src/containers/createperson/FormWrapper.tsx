import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 20px 60px;
  background-color: #FFF;
  .asterisk{
    color: red;
  }

  .form_control {
    width: 100%;
    border-radius: 4px;
    border: 1px solid #D6D6D6;
    padding: 11px 13px;

    &:focus {
      border-color: #99CC33;
    }
  }

  .error-input {
    border-color: var(--red);
  }

  .heading{
    display: flex;
    align-items: center;
    color: var(--green);
    font-size: 14px;
    margin-bottom: 15px;
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';

    svg {
        margin-right: 6px;
        transform: translateY(-1px);
    }
  }

  form{

    hr{
        border-top: 1px solid #F2F2F4;
        border-left: 1px solid #F2F2F4;
    }

  .input-item{
    width: 292px;
    margin-right: 10px;
    margin-bottom: 19px;
    & sup {
        color: #C54343;
    }
  }
  
  .input-item-large{
    width: 594px;
    margin-right: 10px;
    margin-bottom: 19px;
    & sup {
        color: #C54343;
    }
    
    & > label{
      display: inline-block;
      margin-bottom: 6px;
    }
  }

  @media (max-width: 1440px){
    .input-item{
        width: 292px;
        margin-right: 10px;
    }
  }

  h4.section-header{
    font-weight: bold;
    color: black;
    margin: 0px 0 10px;
  }

  .personal-info{

    .picker-container {
      width: 292px;
      
      .react-datepicker-wrapper{
        width: 100%;
      }
    }

    @media (max-width:1440px){
      .picker-container {
        width: 292px;
        
        .react-datepicker-wrapper{
          width: 100%;
        }
      }

      .input-item{
        width: 292px;
      }
  
    }

    .birth-date{
      display: flex;

      span.age{
        margin-top: 12px;
        margin-left: 10px;
      }
    }

    .input-item{
      & > label{
        display: inline-block;
        margin-bottom: 6px;
      }

    }

    .top{
      display: flex;
      align-items: flex-start;

      .input-item{
        p{
          display: inline-block;
          margin-bottom: 6px; 
        }
      }
  
    }
  }

  .addresses-section{
    margin-top: 22px;

    .mailing-address{
      transition: max-height 0.5s;
      overflow: hidden;
    }

    .state-dropdown{
      .dd-container{
        position: static !important;

        div{
          max-width: 204px;
        }
      }
    }

    & > label{
      display: inline-block;
      margin-bottom: 6px;
    }

    .state-province{
      display: flex;

      .input-item{
        max-width: 303px;
        input{
          max-width: 303px;
        }
        
         & > label{
            display: inline-block;
            margin-bottom: 6px;
         }
      }
      
    }
  }

  .contact-section{
    margin-top: 22px;

    .input-item{
      width: 594px;
    }

    .work-phone{
      display: flex;

      .work-phone-input{
        width: 594px;
      }

      @media (max-width: 1440px){
        
        
      .work-phone-input{
        width: 594px;
      }

        @media (-webkit-device-pixel-ratio: 1.5) {
          .work-phone-input{
            width: 594px;
          }
        }

      .input-item{
        width: 416px;
      }
      }

      .auth_form_group{
        min-width: 436px;
      }

      input{
        width: 292px;
      }

      .ext{
          margin-left: 10px;
          min-width: 295px;
      }
    }
  }

  .job-section{
    margin-top: 22px;
    .picker-container{
      max-width: 203px;
    }

    .disclaimer{
      font-size: 10px;
      color: #464646;
      display: inline-block;
      margin-bottom: 25px;
    }
    
    .item{
      display: flex;
      justify-content: space-between;
      max-width: 1210px;

      .input-item{
        width: 100%;

        & > label{
          display: inline-block;
          margin-bottom: 6px;
        }
      }
    }
  }

  .compensation-section{
    margin-top: 22px;

    .pay-rate{
      display: flex;
      align-items: flex-end;
      position: relative;
      width: auto !important;

      .error{
        position: absolute;
        bottom: -16px;
      }
  
      .currency-select{
        position: absolute;
        top: 31px;
        border: none;
        left: 120px;
        max-width: 72px;
      }

      @media (max-width: 1440px){
        .currency-select{
          left: 132px;

          div.currency-header{
            max-height: 36px;
          }
        
          div{
            margin-bottom: 10px;
          }
        }
      }

      .currency-header{
        border: none;
        border-left: 1px solid #D6D6D6;
        border-radius: 0;

        .close{
          display: none;
        }

        img{
          max-width: 10px;
          margin-left: 4px !important;
          margin-top: -3px;
        }

        .rotated{
          img{
            margin-right: 4px;
          }
        }
      }

      .currency-body{
        width: 240px;
      }
      
      span.per{
        margin-top: 12px;
        margin-left: 15px;
        margin-right: 12px;
        display: inline-block;
      }
    }

    .input-item{
      margin-top: 22px;

      & > label{
        margin-bottom: 6px;
        display: inline-block;
      }
    }
    
    .disclaimer{
      font-size: 10px;
      color: #464646;
      margin-top: 6px;
      display: inline-block;
      margin-bottom: 14px;
    }

    .picker-container{
      max-width: 203px;
    }
  }
  
  .system-access{
    max-width: 1210px;

    .radio-item{
      display: flex;
      padding: 18px 30px;
      width: 594px;
      border-radius: 4px;
      background: #F2F2F4;
      margin-right: 10px;
      cursor: pointer;
      align-items: center;
      color: #696969;
      overflow: hidden;
      position: relative;

      .title{
        display: flex;
        align-items: center;
        font-size: 13px;
        color: #00101A;
        font-weight: 500;
        
        svg {
          margin-right: 6px;
          & path {
            fill: #878787
          }
        }
      }

      .subtitle{
        font-size: 12px;
        line-height: 18px;
        margin-top: 5px;
      }
    }

    .selected{
      background: #F0F7F4;
    }
    
    .d-flex {
      .input-item{
        & > label{
          margin-bottom: 6px;
          display: inline-block;
        }
      }
    }
  }

  .enable-text{
    margin-top: 10px;
    margin-bottom: 20px;
    max-width: 370px;
    color: #464646;
    line-height: 16px;
    font-size: 10px;
  }

  .select{
    max-width: 416px;
    margin-top: 25px;
  }
}

.create-account{
  display: flex;
  width: 93%;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  padding: 15px 0px;
  position: fixed;
  bottom: 62px;
  border-top: 1px solid #F2F2F4;
}
`;

export default Wrapper;