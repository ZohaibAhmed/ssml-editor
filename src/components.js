import React from 'react'
import styled from 'react-emotion'

export const Button = styled('span')`
  cursor: pointer;
  padding: 5px;
  color: ${props =>
    props.reversed
      ? props.active ? 'white' : '#aaa'
      : props.active ? 'black' : '#ccc'};
`

export const Menu = styled('div')`
  & > * {
    display: inline-block;
  }

  & > * + * {
    margin-left: 15px;
  }
`

export const Toolbar = styled(Menu)`
  position: relative;
  padding: 20px 18px 17px 20px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`