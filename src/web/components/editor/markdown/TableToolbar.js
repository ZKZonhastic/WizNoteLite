import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import classNames from 'classnames';
import Menu from '@material-ui/core/Menu';
import Icons from '../../../config/icons';
import { filterParentElement, hasClass } from '../libs/dom_utils';
import { getRange } from '../libs/range_utils';

const useStyles = makeStyles(({ spacing, custom }) => ({
  menu: {
    position: 'absolute',
    display: 'none',
    '&.active': {
      display: 'block',
    },
  },
  iconButton: {
    '&:hover $icon': {
      color: custom.color.contentToolIconHover,
    },
    // '&:hover': {
    //   backgroundColor: 'transparent',
    // },
  },
  icon: {
    width: spacing(3),
    height: spacing(3),
    color: custom.color.contentToolIcon,
  },
  menuContainer: {
    padding: spacing(2, 3, 1, 3),
    outline: 'none',
  },
  boxContainer: {
    marginBottom: spacing(2),
  },
  row: {
    display: 'flex',
    '&:not(:nth-last-child(1))': {
      marginBottom: '3px',
    },
  },
  box: {
    width: '16px',
    height: '16px',
    border: `solid 1px ${custom.color.contentToolIcon}`,
    cursor: 'pointer',
    outline: 'none',
    backgroundColor: 'transparent',
    '&:not(:nth-last-child(1))': {
      marginRight: '3px',
    },
    '&.active': {
      backgroundColor: 'rgba(68, 138, 255, 0.3)',
      borderColor: '#006eff',
    },
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: custom.color.contentToolIcon,
  },
  input: {
    width: '24px',
    height: '20px',
    textAlign: 'center',
    fontSize: '12px',
    outline: 'none',
  },
  unit: {
    margin: '0 5px',
  },
}));

let tableElement;

function TableToolbar(props) {
  const classes = useStyles();

  const [menuPos, setMenuPos] = useState(undefined);

  const [rowCount, setRowCount] = useState(0);
  const [colCount, setColCount] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);

  function updatedTable(rowNumber, colNumber) {
    const row = parseInt(rowNumber, 10);
    const col = parseInt(colNumber, 10);
    if (Number.isNaN(row) || Number.isNaN(col)) {
      return;
    }
    const tableBoxHtmlArr = [...tableElement.rows].map(
      (rows) => [...rows.children].map((box) => box.outerHTML),
    );
    tableElement.querySelector('thead tr').innerHTML = Array.from(Array(col), (item, index) => tableBoxHtmlArr[0]?.[index] ?? '<th> </th>').join('');
    const tbody = tableElement.querySelector('tbody');
    if (row === 1) {
      if (tbody) {
        tbody.outerHTML = '';
      }
    } else {
      const htmlArr = [];
      for (let i = 1; i < row; i++) {
        let htmlStr = '<tr>';
        for (let j = 0; j < col; j++) {
          if (i < tableBoxHtmlArr.length && j < tableBoxHtmlArr[i].length) {
            htmlStr += tableBoxHtmlArr[i][j];
          } else {
            htmlStr += '<td> </td>';
          }
        }
        htmlArr.push(`${htmlStr}</tr>`);
      }
      if (tbody) {
        tbody.innerHTML = htmlArr.join('');
      } else {
        tableElement.innerHTML += `<tbody>${htmlArr.join('')}</tbody>`;
      }
    }
    // 修改 DOM 后，要触发 addToUndoStack 方法，保证 可以正常 undo
    props.editor.vditor.undo.addToUndoStack(props.editor.vditor);
    props.onSaveNote();
  }

  function menuBtnClickHandler(e) {
    setAnchorEl(e.currentTarget);
    e.preventDefault();
  }

  function closeMenuHandler() {
    setAnchorEl(null);
  }

  function boxClickHandler(row, col) {
    updatedTable(row, col);
    closeMenuHandler();
  }

  useEffect(() => {
    function selectionChangeHandler() {
      if (!anchorEl) {
        const range = getRange();
        if (range) {
          const ele = filterParentElement(range.startContainer, props.editor.vditor.element, (dom) => dom.tagName.toLocaleLowerCase() === 'table');
          if (ele) {
            if (ele !== tableElement) {
              tableElement = ele;
              setMenuPos({
                top: `${tableElement.offsetTop - 12}px`,
                left: `${tableElement.offsetLeft - 32}px`,
              });
            }
            return;
          } else if (filterParentElement(
            range.startContainer,
            document.body,
            (dom) => hasClass(dom, classes.menuContainer),
          )) {
            return;
          }
        }
        if (menuPos) {
          tableElement = undefined;
          setMenuPos(undefined);
          closeMenuHandler();
        }
      }
    }

    function mouseoverHandler(e) {
      const ele = filterParentElement(
        e.target,
        document.body,
        (dom) => hasClass(dom, classes.boxContainer),
        true,
      );
      if (ele) {
        const box = filterParentElement(
          e.target,
          document.body,
          (dom) => hasClass(dom, classes.box),
          true,
        );
        if (box) {
          const indexArr = box.getAttribute('data-coordinate').split('-');
          setRowCount(parseInt(indexArr[0], 10) + 1);
          setColCount(parseInt(indexArr[1], 10) + 1);
        }
      }
    }

    function mousedownHandler(e) {
      if (anchorEl && (!filterParentElement(e.target, document, (dom) => hasClass(dom, 'table-toolbar-menu'), true))) {
        closeMenuHandler();
        e.preventDefault();
      }
    }

    document.addEventListener('selectionchange', selectionChangeHandler);
    document.addEventListener('mouseover', mouseoverHandler);
    document.addEventListener('mousedown', mousedownHandler, true);
    return () => {
      document.removeEventListener('selectionchange', selectionChangeHandler);
      document.removeEventListener('mouseover', mouseoverHandler);
      document.removeEventListener('mousedown', mousedownHandler, true);
    };
  }, [props.editor, menuPos, classes, anchorEl]);

  useEffect(() => {
    if (anchorEl) {
      setRowCount(tableElement?.rows.length ?? 0);
      setColCount(tableElement?.rows[0].childElementCount ?? 0);
    }
  }, [anchorEl]);

  return (
    <div
      className={classNames(classes.menu, {
        active: Boolean(menuPos),
      })}
      style={menuPos}
    >
      <IconButton className={classes.iconButton} onMouseDown={menuBtnClickHandler}>
        <Icons.TableBarIcon className={classes.icon} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(menuPos) && Boolean(anchorEl)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        classes={{
          paper: 'table-toolbar-menu',
        }}
        getContentAnchorEl={null}
      >
        <div className={classes.menuContainer}>

          <div className={classes.boxContainer}>
            {Array.from(Array(8), (row, y) => (
              <div className={classes.row} key={y.toString()}>
                {Array.from(Array(8), (item, x) => (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  <button
                    type="button"
                    className={classNames(classes.box, {
                      active: y <= rowCount - 1 && x <= colCount - 1,
                    })}
                    key={`${y.toString()}-${x.toString()}`}
                    data-coordinate={`${y}-${x}`}
                    onClick={() => boxClickHandler(y + 1, x + 1)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className={classes.inputContainer}>
            <input
              type="text"
              className={classes.input}
              value={rowCount}
              onChange={(e) => setRowCount(e.target.value)}
              onBlur={() => updatedTable(rowCount, colCount)}
            />
            <span className={classes.unit}>x</span>
            <input
              type="text"
              className={classes.input}
              value={colCount}
              onChange={(e) => setColCount(e.target.value)}
              onBlur={() => updatedTable(rowCount, colCount)}
            />
          </div>
        </div>
      </Menu>
    </div>
  );
}

TableToolbar.propTypes = {
  editor: PropTypes.object,
  onSaveNote: PropTypes.func.isRequired,
};

TableToolbar.defaultProps = {
  editor: null,
};

export default TableToolbar;
