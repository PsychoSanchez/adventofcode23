package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

const INPUT_FILE = "../data/day-6.data"
const TIME_PREFIX = "Time: "
const DISTANCES_PREFIX = "Distance: "

func readDataFile() string {
	data, err := os.ReadFile(INPUT_FILE)
	if err != nil {
		panic(err)
	}

	return string(data)
}

func parseIntArray(strs []string) []int {
	result := make([]int, 0)

	for _, str := range strs {
		s := strings.Trim(str, " ")
		if s == "" {
			continue
		}

		data, err := strconv.Atoi(str)
		if err != nil {
			panic(err)
		}

		result = append(result, data)
	}

	return result
}

func processInput1(input string) ([]int, []int) {
	lines := strings.Split(input, "\n")
	timeStrRange := strings.Split(strings.TrimPrefix(lines[0], TIME_PREFIX), " ")
	distanceStrRange := strings.Split(strings.TrimPrefix(lines[1], DISTANCES_PREFIX), " ")

	times := parseIntArray(timeStrRange)
	distances := parseIntArray(distanceStrRange)

	if len(times) != len(distances) {
		panic("Time and distance range must be the same length")
	}

	return times, distances
}

func processInput2(input string) (int, int) {
	lines := strings.Split(input, "\n")
	timeStr := strings.Join(strings.Split(strings.TrimPrefix(lines[0], TIME_PREFIX), " "), "")
	distanceStr := strings.Join(strings.Split(strings.TrimPrefix(lines[1], DISTANCES_PREFIX), " "), "")

	time, err := strconv.Atoi(timeStr)
	if err != nil {
		panic(err)
	}
	distance, err := strconv.Atoi(distanceStr)
	if err != nil {
		panic(err)
	}

	return time, distance
}

func getAmountOfWinningOptions(time int, distance int) int {
	left := 1
	right := time - 1

	// left and right are speed
	for left < right {
		leftDistance := left * (time - left)
		rightDistance := right * (time - right)

		if leftDistance > distance && rightDistance > distance {
			break
		}

		if leftDistance <= distance {
			left = left + 1
		}

		if rightDistance <= distance {
			right = right - 1
		}
	}

	return right - left + 1
}

func main() {
	input := readDataFile()
	times, distances := processInput1(input)

	var multiplicationResult = 1
	for i := 0; i < len(times); i++ {
		time := times[i]
		distance := distances[i]

		bestTime := getAmountOfWinningOptions(time, distance)

		multiplicationResult = multiplicationResult * bestTime
	}

	fmt.Printf("Part1: Multiplication result of all winning options %d\n", multiplicationResult)

	time, distance := processInput2(input)
	bestTime := getAmountOfWinningOptions(time, distance)
	fmt.Printf("Part2: Winning options for is %d\n", bestTime)
}
