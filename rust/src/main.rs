#![feature(try_blocks)]

pub mod constants;

use std::{collections::HashMap, io::BufRead};

use constants::DATA_FOLDER_PATH;
use itertools::Itertools;

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

fn get_iterator_of_positions_around(
    symbols: &Vec<Vec<char>>,
    row: usize,
    col_start: usize,
    col_end: usize,
) -> impl Iterator<Item = [usize; 2]> + '_ {
    let from_col_index: usize = std::cmp::max(col_start as i32 - 1, 0) as usize;
    let to_col_index: usize = std::cmp::min(col_end + 1, symbols[row].len() - 1);

    (from_col_index..=to_col_index)
        .map(move |col_index| {
            // top and bottom
            let row_above = if row > 0 { row - 1 } else { usize::MAX };
            [row_above, row + 1]
                .into_iter()
                .filter(move |row_index| is_in_bounds(symbols, *row_index, col_index))
                .map(move |row_index| [row_index, col_index])
        })
        .flatten()
        // left and right
        .merge([[row, from_col_index], [row, to_col_index]])
}

// Для потомков!
// fn is_symbol_around(
//     symbols: &Vec<Vec<char>>,
//     row: usize,
//     col_start: usize,
//     col_end: usize,
// ) -> bool {
// let from_col_index: usize = std::cmp::max(col_start as i32 - 1, 0) as usize;
// let to_col_index: usize = std::cmp::min(col_end + 1, symbols[row].len() - 1);
// is_symbol(symbols.get(row).unwrap().get(from_col_index)) || // as
//     is_symbol(symbols.get(row).unwrap().get(to_col_index)) || // as
//     (from_col_index..=to_col_index).any(|i| {
//         is_symbol(try { symbols.get(row + 1)?.get(i)? }) || (row > 0 && is_symbol(try {
//             symbols.get(row - 1)?.get(i)?
//         }))
//     })
// }

fn is_symbol_around(
    symbols: &Vec<Vec<char>>,
    row: usize,
    col_start: usize,
    col_end: usize,
) -> bool {
    get_iterator_of_positions_around(symbols, row, col_start, col_end)
        .any(|[row, col]| is_symbol(&symbols[row][col]))
}

fn find_stars_around(
    symbols: &Vec<Vec<char>>,
    row: usize,
    col_start: usize,
    col_end: usize,
) -> Vec<[usize; 2]> {
    get_iterator_of_positions_around(symbols, row, col_start, col_end)
        .filter(|[row, col]| is_star(&symbols[*row][*col]))
        .collect()
}

fn main() {
    let (symbols, numbers) = process_input();

    // Part 1

    let result1 = numbers
        .iter()
        .flat_map(|line| {
            line.iter()
                .filter(|num| is_symbol_around(&symbols, num.row, num.col_start, num.col_end))
                .map(|num| num.value)
        })
        .sum::<u32>();

    println!("Part 1: {}", result1);

    // Part 2

    #[derive(Debug)]
    struct StarIntersection {
        key: String,
        value: u32,
    }

    let intersections = numbers
        .iter()
        .flat_map(|line| line.iter())
        .flat_map(|num| {
            let stars_around = find_stars_around(&symbols, num.row, num.col_start, num.col_end);

            stars_around.into_iter().map(|[row, col]| StarIntersection {
                key: format!("{}-{}", row, col),
                value: num.value,
            })
        })
        .collect_vec();

    let mut star_intersections: HashMap<String, Vec<u32>> = HashMap::new();
    for intersection in intersections {
        let values = star_intersections
            .entry(intersection.key)
            .or_insert(Vec::new());

        values.push(intersection.value);
    }

    let result2 = star_intersections
        .iter()
        .filter(|(_, values)| values.len() > 1 && values.len() < 3)
        .map(|(_, values)| values[0] * values[1])
        .sum::<u32>();

    println!("Part 2: {}", result2);
}
