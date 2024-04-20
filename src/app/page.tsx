'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useMediaQuery from '@mui/material/useMediaQuery';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import TableFooter from '@mui/material/TableFooter';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import IconButton from '@mui/material/IconButton';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {BannerTop, Footer, RankingZoom} from '@/components';
import { useTheme } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import styles from './page.module.scss';

interface Player {
  attributes: {
    name: string;
    tournaments: number;
    points: number;
    profile: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
  };
}

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

async function getPlayers(selectedOption: string | null): Promise<Player[]> {
  if (!selectedOption) {
    throw new Error("Selected option is required");
  }

  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/players?sort=points:desc&populate=*`;
  if (selectedOption) {
    url += `&filters[groups][$eq]=${encodeURIComponent(selectedOption)}`;
  }

  const response = await fetch(url);
  if(!response.ok) {
    throw new Error('Network response was not ok');
  }
  const result = await response.json();
  return result.data;
}

export default function Home() {
  const isTabletLand = useMediaQuery('(min-width:975px)');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [group, setGroup] = React.useState('Grupo das 18');

  const { data } = useQuery({ 
    queryKey: ['beachPlayers', group], 
    queryFn: () => getPlayers(group),
    retry: 2 
  });
  const players = data || [];

  const handleChange = (event: SelectChangeEvent) => {
    setGroup(event.target.value as string);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - players.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <main className={styles.main}>

    {isTabletLand && (
      <div className={styles.firstFiveChampions}>
        {players.slice(0, 5).map((player, index) => (
          <RankingZoom
            key={index}
            name={player.attributes.name}
            img={player.attributes.profile.data? player.attributes.profile.data.attributes.url : null}
            position={index + 1}
          />
        ))}
      </div>
    )}
      <BannerTop />
      <div className={styles.selectCategoryContainer}>
        <div className={styles.select}>
          <FormControl>
            <InputLabel id="group-select">Ranking por Grupos</InputLabel>
            <Select
              labelId="group-select"
              id="demo-simple-select"
              value={group}
              label="Ranking por Grupos"
              onChange={handleChange}
              inputProps={{MenuProps: {disableScrollLock: true}}}
            >
              <MenuItem value={'Grupo das 18'}>Grupo das 18:00 Horas</MenuItem>
              <MenuItem value={'Grupo das 19'}>Grupo das 19:00 Horas</MenuItem>
              <MenuItem value={'Grupo das 20'}>Grupo das 20:00 Horas</MenuItem>
              <MenuItem value={'Grupo das 21'}>Grupo das 21:00 Horas</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <TableContainer component={Paper} style={{ marginBottom: isTabletLand ? 128 : 0}} className={styles.table}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell><strong>RANKING</strong></TableCell>
              <TableCell align="center"><strong>NOME</strong></TableCell>
              {isTabletLand && (
                <TableCell align="center"><strong>TORNEIOS JOGADOS</strong></TableCell>
              )}
              <TableCell align="center"><strong>PONTOS</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Não há jogadores cadastrados no momento
                </TableCell>
              </TableRow>
            ) : (
              players.map((player, index) => (
                <TableRow
                  key={`${player.attributes.name}-${uuidv4()}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell style={{ fontSize: 18 }} component="th" scope="row">
                    <strong>{index + 1}</strong>
                  </TableCell>
                  <TableCell align="center">
                    <div className={styles.userCell}>
                      <div className={styles.userThumbContainer}>
                        <img className={styles.userThumb} src={player.attributes.profile.data.attributes.url} alt="Profile" />
                      </div>
                      <div className={styles.userNameContainer}>
                        <p>{player.attributes.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  {isTabletLand && (
                    <TableCell align="center">{player.attributes.tournaments}</TableCell>
                  )}
                  <TableCell align="center">{player.attributes.points}</TableCell>
                </TableRow>
              ))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          {players.length > 10 && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
                  colSpan={3}
                  count={players.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  labelRowsPerPage="Máx de itens:"
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>

      <Footer />
    </main>
  )
}
