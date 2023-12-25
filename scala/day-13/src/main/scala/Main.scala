// #.##..##.
// ..#.##.#.
// ##......#
// ##......#
// ..#.##.#.
// ..##..##.
// #.#.##.#.

// #...##..#
// #....#..#
// ..##..###
// #####.##.
// #####.##.
// ..##..###
// #....#..#
var input1 = """#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.""";
var input2 = """#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#""";

def getValue(lines: Array[String], columnIndex: Int, rowIndex: Int): Char =
  var columnCount = lines(0).length
  var rowCount = lines.length
  if columnIndex < 0 || rowIndex < 0 || columnIndex >= columnCount || rowIndex >= rowCount
  then ' '
  else lines(rowIndex)(columnIndex)

def getPivotPointCompareIndexes(
    total: Int
): IndexedSeq[IndexedSeq[(Int, Int)]] =
  var lastToCompareIndex = total - 2
  var middle = lastToCompareIndex.toDouble / 2

  // compare rows in the following order
  // 0:
  // 1: 0 1
  // 2: 1 2, 0 3
  // 3: 2 3, 1 4, 0 5
  // 4: 3 4, 2 5
  // 5: 4 5
  // 6:

  var toCompare = (0 to lastToCompareIndex).map(pivotPoint => {
    var distance =
      middle - math.abs(middle - pivotPoint)
    var optionCount = math.floor(distance).toInt

    (0 to optionCount).map { i =>
      var first = pivotPoint - i
      var second = pivotPoint + i + 1

      (first, second)
    }
  })

  toCompare

def findSumForMirrorPoints(input: String): Int =
  var lines = input.split("\n").toArray
  var rowCount = lines.length
  var columnCount = lines(0).length

  var rowMirrorPoint = getPivotPointCompareIndexes(rowCount)
    .indexWhere((indexes) =>
      indexes.forall((indexPair) => {
        var (first, second) = indexPair
        var firstLine = lines(first)
        var secondLine = lines(second)

        firstLine == secondLine
      })
    )

  var colMirrorPoint = getPivotPointCompareIndexes(columnCount)
    .indexWhere((indexes) =>
      indexes.forall((indexPair) => {
        var (firstIndex, secondIndex) = indexPair
        (0 to rowCount - 1).forall((rowIndex) => {
          var firstChar = getValue(lines, firstIndex, rowIndex)
          var secondChar = getValue(lines, secondIndex, rowIndex)

          firstChar == secondChar
        })
      })
    )

  (rowMirrorPoint + 1) * 100 + colMirrorPoint + 1

def part1(input: String): Int =
  var puzzles = input.split("\n\n").toArray

  puzzles.map(findSumForMirrorPoints).sum

def findSumForMirrorPointsWithCorrection(input: String): Int =
  var lines = input.split("\n").toArray
  var rowCount = lines.length
  var columnCount = lines(0).length

  var rowMirrorPoint = getPivotPointCompareIndexes(rowCount)
    .indexWhere((indexes) =>
      indexes
        .map((indexPair) =>
          (lines(indexPair._1).toCharArray(), lines(indexPair._2).toCharArray())
        )
        .map((lines) =>
          (0 to lines._1.length - 1)
            .filter((i) => lines._1(i) != lines._2(i))
            .size
        )
        .sum == 1
    )

  var colMirrorPoint =
    if (rowMirrorPoint > -1) then -1
    else
      getPivotPointCompareIndexes(columnCount)
        .indexWhere((indexes) =>
          indexes
            .map(indexPair => {
              var (firstColumnIndex, secondColumnIndex) = indexPair

              (0 to rowCount - 1)
                .filter((rowIndex) =>
                  lines(rowIndex)(firstColumnIndex) != lines(rowIndex)(
                    secondColumnIndex
                  )
                )
                .size
            })
            .sum == 1
        )

  println(
    s"(rowMirrorPoint, colMirrorPoint): (${rowMirrorPoint}, ${colMirrorPoint}))"
  )
  (rowMirrorPoint + 1) * 100 + colMirrorPoint + 1

def part2(input: String): Int =
  var lines = input.split("\n\n").toArray

  lines.map(findSumForMirrorPointsWithCorrection).sum

// read file
def readFile(filename: String): String =
  val source = scala.io.Source.fromFile(filename)
  try source.mkString
  finally source.close()

@main def main: Unit =
  val testData = input1 + "\n\n" + input2
  val fileData = readFile("../../data/day-13.data")
  var test = part1(testData)
  println(s"part1 test: ${test}")
  var part1Result = part1(fileData)
  println(s"part1 result: ${part1Result}")

  var test2 = part2(testData)
  println(s"part2 test: ${test2}")
  var part2Result = part2(fileData)
  println(s"part2 result: ${part2Result}")
