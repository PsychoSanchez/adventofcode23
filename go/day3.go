package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/samber/lo"
)

const INPUT_FILE_PATH = "../data/day-3.data"
const TEST_INPUT = `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`

func readDataFile() string {
	data, err := os.ReadFile(INPUT_FILE_PATH)
	if err != nil {
		panic(err)
	}

	return string(data)
}

func isDot(r rune) bool {
	return r == '.'
}

func isStar(r rune) bool {
	return r == '*'
}

func isNumber(r rune) bool {
	return r >= '0' && r <= '9'
}

func isSymbol(r rune) bool {
	return !isDot(r) && !isNumber(r)
}

type NumberPositionInMatrix struct {
	value      uint
	startIndex int
	endIndex   int
}

func processInput(input string) ([]string, [][]NumberPositionInMatrix) {
	lines := strings.Split(input, "\n")

	numbers := lo.Map[string, []NumberPositionInMatrix](lines, func(line string, _ int) []NumberPositionInMatrix {
		result := make([]NumberPositionInMatrix, 0)

		temp := strings.Builder{}
		startIndex := -1
		for i, r := range line {
			if isNumber(r) {
				if startIndex == -1 {
					startIndex = i
				}

				temp.Write([]byte{byte(r)})
				continue
			}

			if startIndex != -1 {
				str := temp.String()
				temp.Reset()

				num, err := strconv.Atoi(str)
				if err != nil {
					panic(err)
				}

				result = append(result, NumberPositionInMatrix{
					value:      uint(num),
					startIndex: startIndex,
					endIndex:   i - 1,
				})
				startIndex = -1
			}
		}

		if startIndex != -1 {
			str := temp.String()

			num, err := strconv.Atoi(str)
			if err != nil {
				panic(err)
			}

			result = append(result, NumberPositionInMatrix{
				value:      uint(num),
				startIndex: startIndex,
				endIndex:   len(line) - 1,
			})
		}

		return result
	})

	return lines, numbers
}

type Position struct {
	row uint
	col uint
}

func getPositionsAroundNumber(
	lines []string,
	number NumberPositionInMatrix,
	rowIndex int,
) []Position {
	fromIndex := max(number.startIndex-1, 0)
	toIndex := min(number.endIndex+1, len(lines[rowIndex])-1)

	colIndexes := lo.RangeFrom(fromIndex, toIndex-fromIndex+1)
	positions := lo.FlatMap[int, Position](colIndexes, func(colIndex int, _ int) []Position {
		rows := lo.Filter[int]([]int{
			rowIndex - 1,
			rowIndex + 1,
		}, func(row int, _ int) bool {
			return row >= 0 && row < len(lines) && len(lines[row]) > colIndex
		})

		return lo.Map[int, Position](rows, func(row int, _ int) Position {
			return Position{
				row: uint(row),
				col: uint(colIndex),
			}
		})
	})

	positions = append(positions, Position{
		row: uint(rowIndex),
		col: uint(fromIndex),
	})

	positions = append(positions, Position{
		row: uint(rowIndex),
		col: uint(toIndex),
	})

	return positions
}

func isSymbolAroundNumber(
	lines []string,
	number NumberPositionInMatrix,
	rowIndex int,
) bool {
	positions := getPositionsAroundNumber(lines, number, rowIndex)

	return lo.SomeBy[Position](positions, func(pos Position) bool {
		return isSymbol(rune(lines[pos.row][pos.col]))
	})
}

func findStartAroundNumber(
	lines []string,
	number NumberPositionInMatrix,
	rowIndex int,
) []Position {
	positions := getPositionsAroundNumber(lines, number, rowIndex)

	return lo.Filter[Position](positions, func(pos Position, _ int) bool {
		return isStar(rune(lines[pos.row][pos.col]))
	})
}

func main() {
	input := readDataFile()
	// input := TEST_INPUT

	lines, numbers := processInput(input)

	// Part 1

	numbersAroundSymbols := lo.FlatMap[[]NumberPositionInMatrix, NumberPositionInMatrix](numbers, func(numRow []NumberPositionInMatrix, rowIndex int) []NumberPositionInMatrix {
		return lo.Filter[NumberPositionInMatrix](numRow, func(number NumberPositionInMatrix, _ int) bool {
			return isSymbolAroundNumber(lines, number, rowIndex)
		})
	})

	numbersAroundSymbolsValues := lo.Map[NumberPositionInMatrix, uint](numbersAroundSymbols, func(number NumberPositionInMatrix, _ int) uint {
		return number.value
	})

	totalSum := lo.Sum(numbersAroundSymbolsValues)

	fmt.Println("Part 1:", totalSum)

	if totalSum != 539590 {
		panic("Wrong answer for part 1")
	}

	type NumberWithStarsAround struct {
		number NumberPositionInMatrix
		stars  []Position
	}

	numbersIntersectingWithStars := lo.FlatMap(
		numbers,
		func(numRow []NumberPositionInMatrix, rowIndex int) []NumberWithStarsAround {
			return lo.FlatMap(numRow, func(number NumberPositionInMatrix, _ int) []NumberWithStarsAround {
				stars := findStartAroundNumber(lines, number, rowIndex)

				return lo.Map(stars, func(star Position, _ int) NumberWithStarsAround {
					return NumberWithStarsAround{
						number: number,
						stars:  []Position{star},
					}
				})
			})
		})

	intersections := map[string][]uint{}
	for _, intersection := range numbersIntersectingWithStars {
		for _, star := range intersection.stars {
			key := fmt.Sprintf("%d-%d", star.row, star.col)

			if _, ok := intersections[key]; !ok {
				intersections[key] = []uint{}
			}

			intersections[key] = append(intersections[key], intersection.number.value)
		}
	}

	intersectionsValues := lo.Values(intersections)
	intersectionsValuesWith2Numbers := lo.Filter(intersectionsValues, func(numbers []uint, _ int) bool {
		return len(numbers) == 2
	})

	multipliedIntersectionNumbers := lo.Map(intersectionsValuesWith2Numbers, func(numbers []uint, _ int) uint {
		return numbers[0] * numbers[1]
	})

	totalSum = lo.Sum(multipliedIntersectionNumbers)

	fmt.Println("Part 2:", totalSum)

	if totalSum != 80703636 {
		panic("Wrong answer for part 2")
	}
}
