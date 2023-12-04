pub mod constants;

use std::io::BufRead;

use constants::DATA_FOLDER_PATH;

#[derive(Debug)]
struct NumberMetaInMatrix {
    value: u32,
    row: usize,
    col_end: usize,
    col_start: usize,
}

fn process_input() -> (Vec<Vec<char>>, Vec<Vec<NumberMetaInMatrix>>) {
    let file_path = format!("{}/{}", DATA_FOLDER_PATH, "day-3.data");
    let file = std::fs::File::open(file_path).unwrap();
    let reader = std::io::BufReader::new(file);
    let lines = reader.lines();

    let symbol_matrix: Vec<Vec<char>> = lines.map(|line| line.unwrap().chars().collect()).collect();
    let number_matrix: Vec<Vec<NumberMetaInMatrix>> = symbol_matrix
        .iter()
        .enumerate()
        .map(|(row, line)| {
            let mut result: Vec<NumberMetaInMatrix> = Vec::new();
            let mut temp: String = String::new();
            let mut start_index = usize::MAX;

            line.iter().enumerate().for_each(|(col, symbol)| {
                let is_digit = symbol.is_digit(10);

                if is_digit {
                    temp.push(*symbol);

                    if start_index == usize::MAX {
                        start_index = col;
                    }

                    return;
                }

                if temp.len() == 0 {
                    return;
                }

                let value = temp.parse::<u32>().unwrap();
                let meta = NumberMetaInMatrix {
                    value,
                    row,
                    col_end: col - 1,
                    col_start: start_index,
                };

                // println!("{:?}", meta);

                result.push(meta);
                temp = String::new();
                start_index = usize::MAX;
            });

            if temp.len() > 0 {
                let value = temp.parse::<u32>().unwrap();
                let meta = NumberMetaInMatrix {
                    value,
                    row,
                    col_start: start_index,
                    col_end: line.len() - 1,
                };

                result.push(meta);
            }

            result
        })
        .collect();

    return (symbol_matrix, number_matrix);
}

fn is_number(char: &char) -> bool {
    return char.is_digit(10);
}

fn is_dot(char: &char) -> bool {
    return *char == '.';
}

fn is_star(char: &char) -> bool {
    return *char == '*';
}

fn is_symbol(char: &char) -> bool {
    return !is_number(char) && !is_dot(char);
}

fn is_in_bounds(symbols: &Vec<Vec<char>>, row: usize, col: usize) -> bool {
    return row < symbols.len() && col < symbols[row].len();
}

fn is_symbol_around(
    symbols: &Vec<Vec<char>>,
    row: usize,
    col_start: usize,
    col_end: usize,
) -> bool {
    let from_col_index: usize = std::cmp::max(col_start as i32 - 1, 0) as usize;
    let to_col_index: usize = std::cmp::min(col_end + 1, symbols[row].len() - 1);

    let is_left_symbol = is_symbol(&symbols[row][from_col_index]);
    let is_right_symbol =
        to_col_index <= symbols[row].len() && is_symbol(&symbols[row][to_col_index]);

    is_left_symbol
        || is_right_symbol
        || (from_col_index..=to_col_index).any(|i| {
            let is_above_symbol =
                row > 0 && is_in_bounds(symbols, row - 1, i) && is_symbol(&symbols[row - 1][i]);
            let is_below_symbol =
                is_in_bounds(symbols, row + 1, i) && is_symbol(&symbols[row + 1][i]);

            is_above_symbol || is_below_symbol
        })
}

fn is_star_around(symbols: &Vec<Vec<char>>, row: usize, col_start: usize, col_end: usize) -> bool {
    (col_start..col_end).any(|i| is_star(&symbols[row - 1][i]) || is_star(&symbols[row + 1][i]))
        || is_star(&symbols[row][col_start - 1])
        || is_star(&symbols[row][col_end + 1])
}

fn main() {
    let (symbols, numbers) = process_input();

    // Part 1

    let result = numbers
        .iter()
        .flat_map(|line| {
            line.iter()
                .filter(|num| is_symbol_around(&symbols, num.row, num.col_start, num.col_end))
                .map(|num| num.value)
        })
        .sum::<u32>();

    println!("Part 1: {}", result);
}
