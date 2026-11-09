/* ================= content: units & subtopics ================= */
const UNITS={
 1:{id:1,name:'Unit 1',title:'Number and place value',subs:['1.1','1.2'],th:'u1'},
 2:{id:2,name:'Unit 2',title:'Sequences, squares, cubes, multiples and factors',subs:['2.1','2.2','2.3'],th:'u2'}
};
const SUBS={
 '1.1':{id:'1.1',unit:1,title:'Place value',src:'LB pp. 12–15 · WB pp. 8–13 · Guide pp. 2–5',qts:['pv-value','pv-regroup','pv-scale','pv-reverse']},
 '1.2':{id:'1.2',unit:1,title:'Rounding',src:'LB pp. 16–19 · WB pp. 15–19 · Guide pp. 6–7',qts:['rd-line','rd-range']},
 '2.1':{id:'2.1',unit:2,title:'Sequences',src:'LB pp. 22–26, 34 · WB pp. 21–25 · Guide pp. 8–11',qts:['sq-jumps','sq-rules','sq-picture','sq-missing']},
 '2.2':{id:'2.2',unit:2,title:'Square and cube numbers',src:'LB pp. 27–29 · WB pp. 26–30 · Guide pp. 12–14',qts:['sc-square','sc-cube','sc-sort']},
 '2.3':{id:'2.3',unit:2,title:'Multiples and factors',src:'LB pp. 30–33 · WB pp. 31–35 · Guide pp. 15–17',qts:['mf-multiple','mf-factor','mf-packs']}
};
const subHash=s=>'s'+s.replace('.','');
const hashSub=h=>{const m=/^s(\d)(\d)$/.exec(h);return m?m[1]+'.'+m[2]:null};

/* ================= question types (Learn content) ================= */
const QT={
'pv-value':{sub:'1.1',title:'Value of a digit',src:'Guide p. 2 · LB pp. 12–14 · WB pp. 9–11 (47.506 from WB p. 10)',
 recognise:'You are given a number and asked what one digit is worth.',prereq:'Place-value column names; tenths, hundredths, thousandths.',
 method:['Write the number in a place-value chart.','Find the column of the digit.','Value = the digit × that column size (e.g. 6 thousandths = 0.006).','Check: add all the values to rebuild the number.'],
 ex:{q:'What is the value of the digit 6 in 47.506?',steps:['Write each digit in its column. The decimal point sits between ones and tenths.','Find the column of the digit 6: it is in the thousandths column.','6 thousandths = 0.006. That is its value.','Check: 40 + 7 + 0.5 + 0 + 0.006 = 47.506 ✓'],answer:'0.006'},
 guided:{text:'In 3.065, which column is the digit 5 in, and what is its value?',parts:[{label:'Column',spec:{t:'choice',opts:['tens','ones','tenths','hundredths','thousandths'],v:'thousandths'}},{label:'Value',spec:{t:'num',v:0.005}}],expl:'3.065 → ones 3, tenths 0, hundredths 6, thousandths 5. So the 5 is worth 0.005.',src:'Guide p. 2'},
 mistake:{wrong:'“The 6 in 47.506 is worth 6.”',why:'The digit alone is not its value. The column tells you its size.',fix:'6 is in the thousandths column → 0.006.'},
 check:'Rebuild the number from the values of all its digits.'},
'pv-regroup':{sub:'1.1',title:'Regroup a decimal',src:'Guide p. 3 · LB p. 14, Q4–6 · WB pp. 9–10',
 recognise:'A number is split into parts in an unusual way, and one part is missing.',prereq:'1 tenth = 10 hundredths; 1 hundredth = 10 thousandths.',
 method:['Show the number with place-value counters.','Compare with the parts given. Which column has too few or too many?',{q:'Is a tenth left over?',yes:'Trade it for 10 hundredths',no:'Look at the next column'},'Count the new number in that column and write the missing part.','Check: add the parts back to the original number.'],
 ex:{q:'Complete: 0.546 = 0.4 + ? + 0.006',steps:['Start with the usual parts: 5 tenths, 4 hundredths, 6 thousandths.','The question keeps only 4 tenths (0.4). One tenth is left over.','Trade that tenth for 10 hundredths. The value does not change.','Now there are 4 + 10 = 14 hundredths = 0.14.','Check: 0.4 + 0.14 + 0.006 = 0.546 ✓'],answer:'0.14'},
 guided:{text:'Complete 0.375 = 0.2 + ? + 0.005. After trading one tenth, how many hundredths are there, and what is the missing part?',parts:[{label:'Hundredths',spec:{t:'num',v:17}},{label:'Missing part',spec:{t:'num',v:0.17}}],expl:'0.375 has 3 tenths. Keep 2 tenths, trade 1 tenth for 10 hundredths: 7 + 10 = 17 hundredths = 0.17.',gen:true},
 mistake:{wrong:'0.546 = 0.4 + 0.04 + 0.006',why:'These parts only make 0.446. The extra tenth was lost.',fix:'Trade the extra tenth: 0.04 + 0.1 = 0.14.'},
 check:'Add the parts. They must make the original number.'},
'pv-scale':{sub:'1.1',title:'Multiply or divide by 10, 100, 1000',src:'Guide p. 4 · LB p. 14, Q7–8 · WB pp. 10–12',
 recognise:'A decimal is multiplied or divided by 10, 100 or 1000.',prereq:'Place-value columns; each column is 10 times the one to its right.',
 method:['Write the number in a place-value chart.',{q:'Multiply or divide?',yes:'× → digits move left',no:'÷ → digits move right'},'Move each digit 1, 2 or 3 places (for 10, 100, 1000).','The decimal point stays between ones and tenths.','Check with the inverse operation.'],
 ex:{q:'Calculate 0.375 × 100',steps:['Write 0.375 in the chart.','× 100 makes each digit 100 times bigger: every digit moves two places left.','The decimal point does not move. It stays between ones and tenths.','Read the answer: 37.5.','Check with the inverse: 37.5 ÷ 100 = 0.375 ✓'],answer:'37.5'},
 guided:{text:'Calculate 4.2 × 1000. How many places does each digit move left, and what is the answer?',parts:[{label:'Places',spec:{t:'num',v:3}},{label:'Answer',spec:{t:'num',v:4200}}],expl:'× 1000 → three places left. 4 ones becomes 4 thousands, 2 tenths becomes 2 hundreds: 4200.',gen:true},
 mistake:{wrong:'0.375 × 100 = 0.37500 (“add two zeros”)',why:'Adding zeros after the last decimal digit does not change the value: 0.37500 = 0.375.',fix:'Move each digit two places left: 37.5.'},
 check:'Do the inverse: ÷ undoes ×, × undoes ÷.'},
'pv-reverse':{sub:'1.1',title:'Reverse a function machine',src:'Guide p. 5 · WB p. 8 worked example, p. 13 Q14 · LB p. 14 Q9',
 recognise:'You know the output of a machine and need the start number.',prereq:'× and ÷ by 10, 100, 1000; inverse operations.',
 method:['Write the machine and its steps.','Start at the output.','Undo the last step first, using the inverse operation.','Keep undoing until you reach the start.','Check: run the machine forwards.'],
 ex:{q:'A number is divided by 10, then by 100. The answer is 0.375. What was the start number?',steps:['Draw the machine: ? → ÷ 10 → ÷ 100 → 0.375.','Start at the answer, 0.375, and work backwards.','Undo ÷ 100 with × 100: 0.375 × 100 = 37.5.','Undo ÷ 10 with × 10: 37.5 × 10 = 375.','Check forwards: 375 ÷ 10 ÷ 100 = 0.375 ✓'],answer:'375'},
 guided:{text:'A number is multiplied by 100, then by 10. The result is 52. Undo × 10 first, then undo × 100.',parts:[{label:'After undoing × 10',spec:{t:'num',v:5.2}},{label:'Start number',spec:{t:'num',v:0.052}}],expl:'52 ÷ 10 = 5.2, then 5.2 ÷ 100 = 0.052. Check: 0.052 × 100 × 10 = 52.',gen:true},
 mistake:{wrong:'Undoing ÷ 100 by dividing again: 0.375 ÷ 100',why:'Dividing again makes it smaller. You need the opposite operation.',fix:'÷ is undone by ×: 0.375 × 100 = 37.5.'},
 check:'Put your start number into the machine forwards.'},
'rd-line':{sub:'1.2',title:'Round to the nearest whole or tenth',src:'Guide p. 6 · LB pp. 16–17 · WB pp. 15–16 (examples 7.81 and 3.95)',
 recognise:'You are asked to round to the nearest whole number or tenth.',prereq:'Number lines with decimals; place value.',
 method:['Same units? If not, convert first (1 l = 1000 ml).','Find the place you round to.','Find the two values either side on a number line.','Look at the digit one place to the right only.',{q:'Is that digit 5 or more?',yes:'Round up to the larger neighbour',no:'Keep the smaller neighbour'},'Write the answer to the right number of places (e.g. 4.0, not 4, for tenths).'],
 ex:{q:'Round 3.95 to the nearest tenth.',steps:['Find the tenths either side: 3.9 and 4.0.','Mark 3.95. Look one digit right of the tenths: it is 5.','3.95 is exactly halfway. Halfway rounds up.','Answer: 4.0. Keep the zero to show tenths.','Check: 3.95 is 0.05 from each neighbour, so it is halfway ✓'],answer:'4.0'},
 guided:{text:'Round 7.81 to the nearest tenth. Which two tenths is it between (the larger one)? What is the answer?',parts:[{label:'Larger neighbour',spec:{t:'num',v:7.9,dp:1}},{label:'Answer',spec:{t:'num',v:7.8,dp:1}}],expl:'7.81 is between 7.8 and 7.9. The next digit is 1, less than 5, so it rounds to 7.8.',src:'Guide p. 6'},
 mistake:{wrong:'7.849 → 7.85 → 7.9 (rounding in steps)',why:'Only the digit one place right of the tenths decides. Here it is 4.',fix:'7.849 rounds to 7.8 (nearest tenth).'},
 check:'Is your answer the closest value on the number line?'},
'rd-range':{sub:'1.2',title:'Find the range that rounds to a value',src:'Guide p. 7 · LB pp. 18–19 · WB p. 17 Q8, p. 19',
 recognise:'You know a rounded value and must find the smallest or largest number that rounds to it.',prereq:'Rounding; halfway rounds up; decimal places.',
 method:['Mark the rounded value and the halfway points either side.','Lower halfway point rounds up → it is included (smallest).','Upper halfway point rounds up to the next value → excluded.','Largest = the number just below the upper halfway point, with the required decimal places.','Check both ends by rounding them.'],
 ex:{q:'Find the smallest and largest numbers with exactly 2 decimal places that round to 10 (nearest whole number).',steps:['Mark 10 and the halfway points either side: 9.5 and 10.5.','9.50 is halfway, and halfway rounds up to 10 → included. Smallest: 9.50.','10.50 rounds up to 11 → excluded.','The largest 2-decimal-place number below 10.50 is 10.49.','Check: 9.50 → 10 and 10.49 → 10 ✓'],answer:'9.50 and 10.49'},
 guided:{text:'Numbers with exactly 2 decimal places round to 3 (nearest whole). Find the smallest and the largest.',parts:[{label:'Smallest',spec:{t:'num',v:2.5,dp:2}},{label:'Largest',spec:{t:'num',v:3.49,dp:2}}],expl:'Halfway points are 2.5 and 3.5. 2.50 is included; 3.50 rounds to 4, so the largest is 3.49.',gen:true},
 mistake:{wrong:'Largest number that rounds to 10 is 10.50',why:'10.50 is halfway, and halfway rounds up — to 11.',fix:'Largest with 2 decimal places: 10.49.'},
 check:'Round your smallest and largest numbers. Both must give the target.'},
'sq-jumps':{sub:'2.1',title:'Count the jumps',src:'Guide p. 8 · LB p. 25, p. 34 Q1 · WB pp. 22–25',
 recognise:'A sequence has a start and a constant step; you need a later term.',prereq:'Adding and subtracting decimals; multiplying by a whole number.',
 method:['Term 1 is the starting point.','Find the step (+ or −).','Number of jumps = position − 1.','Term = start + jumps × step (or − for a decreasing sequence).','Check against a term you can list.'],
 ex:{q:'A sequence starts at 1 and adds 0.4 each time. Find the 10th term.',steps:['Term 1 is the starting point: 1.','Each jump adds 0.4: 1, 1.4, 1.8, 2.2, 2.6 …','From term 1 to term 10 there are 9 jumps (one fewer than the position).','1 + 9 × 0.4 = 1 + 3.6 = 4.6.','Check: term 5 = 1 + 4 × 0.4 = 2.6, which matches the line ✓'],answer:'4.6'},
 guided:{text:'A sequence starts at 2.9 and subtracts 0.5 each time. Find the 5th term.',parts:[{label:'Jumps',spec:{t:'num',v:4}},{label:'5th term',spec:{t:'num',v:0.9}}],expl:'5 terms → 4 jumps. 2.9 − 4 × 0.5 = 2.9 − 2 = 0.9 (2.9, 2.4, 1.9, 1.4, 0.9).',src:'Guide p. 8'},
 mistake:{wrong:'10th term = 1 + 10 × 0.4 = 5',why:'Term 1 has no jump yet, so there are only 9 jumps to term 10.',fix:'1 + 9 × 0.4 = 4.6.'},
 check:'List a few terms and compare with your formula.'},
'sq-rules':{sub:'2.1',title:'Term-to-term and position-to-term rules',src:'Guide p. 9 · LB pp. 22–24 · WB pp. 22–25',
 recognise:'You need a rule for a sequence, or a term far along.',prereq:'Times tables; sequences with a constant step.',
 method:['Write positions above the terms.','Across: find the term-to-term rule (the step).',{q:'Is term 1 equal to the step?',yes:'Position-to-term: term = step × n',no:'term = step × n, then adjust: + (term 1 − step)'},'Use the position-to-term rule to jump straight to a far term.','Check with a term you already know.'],
 ex:{q:'For 3, 6, 9, 12, … find both rules and the 15th term.',steps:['Write the positions 1, 2, 3, 4 above the terms.','Across: each term adds 3. Term-to-term rule: add 3.','Down: position × 3 = term. Position-to-term rule: × 3 (term = 3n).','15th term: 15 × 3 = 45. No need to list 15 terms.','Check: position 4 → 4 × 3 = 12 ✓'],answer:'add 3; 3n; 45'},
 guided:{text:'For 5, 10, 15, 20, … the position-to-term rule is “multiply by ?”. Then find the 30th term.',parts:[{label:'Multiply by',spec:{t:'num',v:5}},{label:'30th term',spec:{t:'num',v:150}}],expl:'Each term is position × 5. 30 × 5 = 150.',gen:true},
 mistake:{wrong:'“Add 3, so the 15th term is 15 + 3 = 18.”',why:'The term-to-term rule (add 3) describes moving across, not position to term.',fix:'Position-to-term: 15 × 3 = 45.'},
 check:'Test your rule on the first term and one other term.'},
'sq-picture':{sub:'2.1',title:'Pictures and flow diagrams as rules',src:'Guide p. 10 · WB p. 21 rockets · LB pp. 22–24 flow diagrams',
 recognise:'A pattern of pictures grows, or a flow diagram makes the sequence.',prereq:'Counting in equal groups; term-to-term rules.',
 method:['Find one repeating unit and count its parts.','Each new unit adds the same amount.','Rule: total = parts in one unit × number of units.','For a flow diagram, follow every box and check the stop condition.','Check by counting the picture.'],
 ex:{q:'Each rocket uses 7 shapes. How many shapes are needed for 3 rockets?',steps:['Count the shapes in one rocket: 7.','Each new rocket adds 7 more: 7, 14, 21.','Rule: shapes = 7 × number of rockets. 3 rockets → 21.','Check: count all the shapes in the picture: 21 ✓'],answer:'21 shapes'},
 guided:{text:'Flow diagram: Write 2 → Add 2 → Is it more than 20? If no, write it and add 2 again; if yes, stop. What is the last number written, and which number makes it stop?',parts:[{label:'Last number written',spec:{t:'num',v:20}},{label:'Number that stops it',spec:{t:'num',v:22}}],expl:'2, 4, 6, …, 20 are written. 22 is more than 20, so it triggers STOP and is not written.',src:'Guide p. 10'},
 mistake:{wrong:'“The next rocket adds 1 shape.”',why:'Each new rocket is a whole new unit of 7 shapes.',fix:'Add 7 each time: 7, 14, 21.'},
 check:'Count the picture, or follow the flow diagram one more time.'},
'sq-missing':{sub:'2.1',title:'Missing terms and “Can this be a term?”',src:'Guide p. 11 · WB p. 25 Q13 · LB pp. 25–26',
 recognise:'Some terms between two known terms are missing, or you must decide if a number is in a sequence.',prereq:'Count the jumps; division.',
 method:['Total change = last known term − first known term.','Count the gaps (one fewer than the number of terms).','Step = total change ÷ gaps.','Fill in the missing terms.','“Can it be a term?” → (target − start) ÷ step must be a whole number of jumps.'],
 ex:{q:'Complete the sequence: 10, ?, ?, ?, 42',steps:['Total change: 42 − 10 = 32.','There are 5 terms, so 4 gaps.','Each jump: 32 ÷ 4 = 8.','Fill in: 18, 26, 34.','Check: 34 + 8 = 42 ✓'],answer:'18, 26, 34'},
 guided:{text:'A sequence starts at 15 and subtracts 0.4 each time. Can 1.5 be a term? Work out (15 − 1.5) ÷ 0.4, then decide.',parts:[{label:'Number of jumps',spec:{t:'num',v:33.75}},{label:'Can 1.5 appear?',spec:{t:'choice',opts:['yes','no'],v:'no'}}],expl:'13.5 ÷ 0.4 = 33.75. That is not a whole number of jumps, so 1.5 cannot appear.',src:'Guide p. 11'},
 mistake:{wrong:'Step = 32 ÷ 5 = 6.4 (dividing by the number of terms)',why:'Jumps happen between terms. 5 terms have only 4 gaps.',fix:'32 ÷ 4 = 8.'},
 check:'Add the step to the last missing term. You must land on the known term.'},
'sc-square':{sub:'2.2',title:'Square numbers',src:'Guide p. 12 · LB pp. 27–29 · WB pp. 27–30',
 recognise:'A number is “squared” (n²), or you need square numbers in a puzzle.',prereq:'Times tables; arrays.',
 method:['Build a square array: n rows and n columns.','n² = n × n.','For puzzles, list the square numbers in order.','Test combinations from the list.','Check by multiplying back.'],
 ex:{q:'Which two square numbers add up to 130?',steps:['2² = 2 × 2 = 4: a 2 by 2 square array.','3² = 3 × 3 = 9.','4² = 4 × 4 = 16. Rows always equal columns.','List the square numbers: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121.','Test: 130 − 81 = 49, and 49 is square. So 7² + 9² = 130 ✓'],answer:'49 + 81'},
 guided:{text:'5² = 5 × ? = ?',parts:[{label:'5 ×',spec:{t:'num',v:5}},{label:'5²',spec:{t:'num',v:25}}],expl:'5² means 5 rows of 5: 5 × 5 = 25.',gen:true},
 mistake:{wrong:'4² = 8',why:'That is 4 × 2. The small 2 means “multiply 4 by itself”.',fix:'4² = 4 × 4 = 16.'},
 check:'Draw or imagine the array: are rows and columns equal?'},
'sc-cube':{sub:'2.2',title:'Cube numbers',src:'Guide p. 13 · LB pp. 27–28 · WB p. 30 Q13',
 recognise:'A number is “cubed” (n³), or a cube is built from small cubes.',prereq:'Square numbers; multiplication.',
 method:['One layer is a square: n × n.','A cube has n layers (height = edge length).','n³ = n × n × n = layer × number of layers.','If you know the base, find the edge first, then the layers.','Check: edge × edge × edge.'],
 ex:{q:'How many small cubes make a 3 × 3 × 3 cube?',steps:['One layer: 3 rows × 3 columns = 9 small cubes.','The cube is 3 cubes tall, so it has 3 layers.','9 + 9 + 9 = 27 = 3 × 3 × 3 = 3³.','Check: 3³ means 3 × 3 × 3, not 3 × 3 ✓'],answer:'27'},
 guided:{text:'A cube has 16 small cubes in its square base. Find the edge length, the number of layers and the total.',parts:[{label:'Edge',spec:{t:'num',v:4}},{label:'Layers',spec:{t:'num',v:4}},{label:'Total',spec:{t:'num',v:64}}],expl:'16 = 4 × 4, so the edge is 4. A cube has 4 layers of 16: 64.',src:'Guide p. 13'},
 mistake:{wrong:'3³ = 9',why:'That is only one layer (3 × 3).',fix:'3³ = 3 × 3 × 3 = 27.'},
 check:'Multiply edge × edge × edge.'},
'sc-sort':{sub:'2.2',title:'Sort square and cube numbers',src:'Guide p. 14 · WB p. 29 Q9–10, p. 26 · LB p. 29 Carroll diagrams',
 recognise:'Numbers must be sorted into square, cube, both or neither.',prereq:'Square numbers to 144; cube numbers to 125.',
 method:['Test each number: is it a square number?','Test: is it a cube number?',{q:'Yes to both?',yes:'Put it in the overlap',no:'Put it in one circle — or outside if neither'},'Check every number is placed once.'],
 ex:{q:'Sort 1, 8, 9, 10, 25, 27, 50, 64 into square, cube, both or neither.',steps:['9 = 3² and 25 = 5² are square, not cube.','8 = 2³ and 27 = 3³ are cube, not square.','1 = 1² = 1³ and 64 = 8² = 4³ are both → overlap.','10 and 50 are neither → outside the circles.'],answer:'see diagram'},
 guided:{text:'Where do these go?',parts:[{label:'81',spec:{t:'choice',opts:['square only','cube only','both','neither'],v:'square only'}},{label:'125',spec:{t:'choice',opts:['square only','cube only','both','neither'],v:'cube only'}}],expl:'81 = 9², not a cube. 125 = 5³, not a square.',gen:true},
 mistake:{wrong:'Putting 64 only in “square”',why:'64 is also 4 × 4 × 4.',fix:'64 goes in the overlap.'},
 check:'Write each number as n² or n³ to prove where it goes.'},
'mf-multiple':{sub:'2.3',title:'Common multiples: meet again',src:'Guide p. 15 · LB pp. 30–32 · WB pp. 32, 35',
 recognise:'Two things repeat at different intervals; when do they happen together?',prereq:'Times tables; multiples.',
 method:['List the multiples of the first number (jumps on a number line).','List the multiples of the second number.','The first shared value after 0 is the answer.','Check by dividing by both numbers.'],
 ex:{q:'A light flashes every 4 minutes and a bell rings every 5 minutes. They start together. When are they next together?',steps:['Light: 0, 4, 8, 12, 16, 20 (multiples of 4).','Bell: 0, 5, 10, 15, 20 (multiples of 5).','The first shared landing point after 0 is 20.','Check: 20 ÷ 4 = 5 and 20 ÷ 5 = 4, no remainders ✓'],answer:'after 20 minutes'},
 guided:{text:'What is the lowest common multiple of 3 and 4?',parts:[{label:'Answer',spec:{t:'num',v:12}}],expl:'3, 6, 9, 12 … and 4, 8, 12 … → 12.',gen:true},
 mistake:{wrong:'“Always multiply the two numbers.”',why:'This gives a common multiple, but not always the first one. For 4 and 6: 24 is common, but 12 comes first.',fix:'List the multiples and take the first shared one.'},
 check:'Divide your answer by both numbers. No remainders?'},
'mf-factor':{sub:'2.3',title:'Common factors',src:'Guide p. 16 · LB p. 32 Q5–7 · WB pp. 31, 33–34',
 recognise:'You need the numbers that divide two numbers exactly.',prereq:'Division facts; factor pairs.',
 method:['Find factor pairs of the first number (arrays with no leftovers).','List its factors in order.','Do the same for the second number.','Common factors = the numbers in both lists.','Check: each divides both numbers exactly.'],
 ex:{q:'Find the common factors of 18 and 24.',steps:['Factor pairs of 24 make arrays: 1 × 24, 2 × 12, 3 × 8, 4 × 6.','Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24.','Factors of 18: 1, 2, 3, 6, 9, 18 (pairs 1 × 18, 2 × 9, 3 × 6).','In both lists: 1, 2, 3, 6.'],answer:'1, 2, 3, 6'},
 guided:{text:'List the common factors of 8 and 12.',parts:[{label:'Common factors',spec:{t:'set',v:[1,2,4]}}],expl:'8: 1, 2, 4, 8. 12: 1, 2, 3, 4, 6, 12. Shared: 1, 2, 4.',gen:true},
 mistake:{wrong:'Including 4 as a common factor of 18 and 24',why:'4 divides 24 but 18 ÷ 4 = 4 r 2.',fix:'Only 1, 2, 3, 6 divide both.'},
 check:'Divide both numbers by each factor. No remainders?'},
'mf-packs':{sub:'2.3',title:'Packs or equal groups?',src:'Guide p. 17 · WB p. 35 Q10–12 · LB p. 32',
 recognise:'A word problem about packs, boxes or sharing with nothing left over.',prereq:'Common multiples; common factors.',
 method:[{q:'Are amounts building up (whole packs, repeating events)?',yes:'Use common multiples',no:'A fixed amount is split into equal groups → use common factors'},'List the multiples (or factors) of both numbers.','Choose the first shared multiple (or the shared factor that fits).','Answer the actual question (packs? fruits per box?).','Check: nothing left over.'],
 ex:{q:'Cakes come in packs of 8. What is the smallest number of packs that can be shared equally among 6 people?',steps:['Packs build up in 8s: 8, 16, 24, 32 …','6 equal shares need a multiple of 6: 6, 12, 18, 24 …','First common multiple: 24 cakes → 24 ÷ 8 = 3 packs.','Check: 24 ÷ 6 = 4 cakes each, nothing left over ✓'],answer:'3 packs'},
 guided:{text:'56 mangoes and 49 peaches go into boxes. Every box holds the same number of fruits (one kind per box), with no fruit left over and more than 1 fruit per box. How many fruits are in each box?',parts:[{label:'Fruits per box',spec:{t:'num',v:7}}],expl:'Split fixed amounts → common factor. Common factors of 56 and 49: 1 and 7. More than 1 → 7.',src:'Guide p. 17'},
 mistake:{wrong:'Answering “24” when the question asks for packs',why:'24 is the number of cakes, not packs.',fix:'24 ÷ 8 = 3 packs.'},
 check:'Re-read the question: did you answer what was asked?'}
};

/* ================= practice items ================= */
const OPEN_U1='Correct method: 2.34 × 100 = 234. Each digit moves two place-value columns left. Writing zeros after the last decimal digit (2.3400) does not change the value.';
const PRACTICE=[
 {id:'u1q1',sub:'1.1',qt:'pv-value',src:'Guide p. 20 Q1',q:'In 62.407, what is the value of the digit 7?',parts:[{spec:{t:'num',v:0.007}}],expl:'0.007. The 7 is in the thousandths column.'},
 {id:'u1q2',sub:'1.1',qt:'pv-value',src:'Guide p. 20 Q2',q:'Write 8.053 as a sum of its non-zero place-value parts.',parts:[{label:'8.053 =',spec:{t:'sum',v:[8,0.05,0.003]},ph:'e.g. 1 + 0.2 + 0.03'}],expl:'8 + 0.05 + 0.003. The tenths digit is zero, so there is no tenths part.'},
 {id:'u1q3',sub:'1.1',qt:'pv-regroup',src:'Guide p. 20 Q3',q:'Complete: 0.682 = 0.5 + ? + 0.002',parts:[{spec:{t:'num',v:0.18}}],expl:'0.18, because 0.5 + 0.18 + 0.002 = 0.682.'},
 {id:'u1q4',sub:'1.1',qt:'pv-scale',src:'Guide p. 20 Q4',q:'Calculate:',parts:[{label:'(a) 0.409 × 1000',spec:{t:'num',v:409}},{label:'(b) 58.6 ÷ 100',spec:{t:'num',v:0.586}}],expl:'(a) 409 — digits move 3 places left. (b) 0.586 — digits move 2 places right.'},
 {id:'u1q5',sub:'1.1',qt:'pv-reverse',src:'Guide p. 20 Q5',q:'A number is divided by 10, then by 100. The result is 0.048. Find the starting number.',parts:[{spec:{t:'num',v:48}}],expl:'0.048 × 100 × 10 = 48. Check: 48 ÷ 10 ÷ 100 = 0.048.'},
 {id:'u1q9',sub:'1.1',qt:'pv-scale',src:'Guide p. 20 Q9',q:'“Multiply 2.34 by 100 by adding two zeros.” Explain the error and correct it.',parts:[{spec:{t:'open',model:OPEN_U1}}],expl:OPEN_U1},
 {id:'u1q6',sub:'1.2',qt:'rd-line',src:'Guide p. 20 Q6',q:'Round 6.95 directly to:',parts:[{label:'(a) the nearest whole number',spec:{t:'num',v:7,dp:0}},{label:'(b) the nearest tenth',spec:{t:'num',v:7,dp:1}}],expl:'(a) 7. (b) 7.0 — for tenths, 9 tenths increases to 10 tenths and carries to the ones.'},
 {id:'u1q7',sub:'1.2',qt:'rd-range',src:'Guide p. 20 Q7',q:'Find the smallest and largest numbers with exactly 2 decimal places that round to 8.',parts:[{label:'Smallest',spec:{t:'num',v:7.5,dp:2}},{label:'Largest',spec:{t:'num',v:8.49,dp:2}}],expl:'Smallest 7.50, largest 8.49. 8.50 would round to 9.'},
 {id:'u1q8',sub:'1.2',qt:'rd-line',src:'Guide p. 20 Q8',q:'Round 10 460 ml to the nearest litre. Convert first.',parts:[{label:'Litres',spec:{t:'num',v:10},unit:'litres'}],expl:'10 460 ml = 10.460 litres, which rounds to 10 litres.'},
 {id:'g1r1',sub:'1.2',qt:'rd-line',gen:true,q:'Round 12.449 to the nearest tenth.',parts:[{spec:{t:'num',v:12.4,dp:1}}],expl:'Look only at the hundredths digit (4): 12.449 → 12.4. Do not round in steps.'},
 {id:'u2q1',sub:'2.1',qt:'sq-jumps',src:'Guide p. 21 Q1',q:'Start at 2.3 and add 0.25. Write the first five terms.',parts:[1,2,3,4,5].map((n,i)=>({label:'Term '+n,spec:{t:'num',v:[2.3,2.55,2.8,3.05,3.3][i]}})),expl:'2.3, 2.55, 2.8, 3.05, 3.3. Add the same 0.25 each time.'},
 {id:'u2q2',sub:'2.1',qt:'sq-jumps',src:'Guide p. 21 Q2',q:'Start at 4.8 and subtract 0.6. Find the 10th term.',parts:[{spec:{t:'num',v:-0.6}}],expl:'There are 9 jumps: 4.8 − 9 × 0.6 = 4.8 − 5.4 = −0.6.'},
 {id:'u2q3',sub:'2.1',qt:'sq-missing',src:'Guide p. 21 Q3',q:'Complete 7, ?, ?, ?, 31. Give both sequence rules.',parts:[{label:'2nd term',spec:{t:'num',v:13}},{label:'3rd term',spec:{t:'num',v:19}},{label:'4th term',spec:{t:'num',v:25}},{label:'Term-to-term rule',spec:{t:'text',v:['add6','+6','plus6','add6eachtime']},ph:'e.g. add 2'},{label:'Position-to-term (term =)',spec:{t:'text',v:['6n+1','n6+1','1+6n','1+n6']},ph:'e.g. 2n + 3'}],expl:'Step = (31 − 7) ÷ 4 = 6, so 7, 13, 19, 25, 31. Term-to-term: add 6. Position-to-term: 6n + 1.'},
 {id:'u2q4',sub:'2.1',qt:'sq-rules',src:'Guide p. 21 Q4',q:'Find the 20th term of 9, 18, 27, 36, …',parts:[{spec:{t:'num',v:180}}],expl:'Position-to-term rule: 9n. 9 × 20 = 180.'},
 {id:'u2q5',sub:'2.2',qt:'sc-cube',src:'Guide p. 21 Q5',q:'Find 4² and 4³.',parts:[{label:'4²',spec:{t:'num',v:16}},{label:'4³',spec:{t:'num',v:64}}],expl:'4² = 16: a 4 × 4 square. 4³ = 64: four 4 × 4 layers.'},
 {id:'u2q5b',sub:'2.2',qt:'sc-cube',src:'Guide p. 21 Q5',q:'Explain the different models for 4² and 4³.',parts:[{spec:{t:'open',model:'4² = 16 is a flat 4 × 4 square array. 4³ = 64 is a cube: four layers of 4 × 4.'}}],expl:'4² = 16 is a flat 4 × 4 square array. 4³ = 64 is a cube: four layers of 4 × 4.'},
 {id:'u2q6',sub:'2.2',qt:'sc-cube',src:'Guide p. 21 Q6',q:'A cube has 25 small cubes in its square base. How many small cubes are in the complete cube?',parts:[{spec:{t:'num',v:125}}],expl:'125. The base is 5 × 5, so the cube has 5 layers of 25.'},
 {id:'u2q7',sub:'2.2',qt:'sc-sort',src:'Guide p. 21 Q7',q:'Sort 1, 8, 16, 27, 64, 10 into square only, cube only, both, neither.',parts:[['1','both'],['8','cube only'],['16','square only'],['27','cube only'],['64','both'],['10','neither']].map(([n,v])=>({label:n,spec:{t:'choice',opts:['square only','cube only','both','neither'],v}})),expl:'Square only: 16. Cube only: 8, 27. Both: 1, 64. Neither: 10.'},
 {id:'u2q8',sub:'2.3',qt:'mf-factor',src:'Guide p. 21 Q8',q:'List all common factors of 12 and 18.',parts:[{spec:{t:'set',v:[1,2,3,6]},ph:'e.g. 1, 2'}],expl:'1, 2, 3, 6. Each divides both 12 and 18 exactly.'},
 {id:'u2q9',sub:'2.3',qt:'mf-multiple',src:'Guide p. 21 Q9',q:'Two events repeat every 6 and 8 minutes. They occur together now. When do they next occur together?',parts:[{label:'After',spec:{t:'num',v:24},unit:'minutes'}],expl:'After 24 minutes: the smallest positive common multiple of 6 and 8.'},
 {id:'u2q10',sub:'2.3',qt:'mf-packs',src:'Guide p. 21 Q10',q:'Pencils come in packs of 10. What is the smallest number of packs that can be shared equally among 6 children?',parts:[{spec:{t:'num',v:3},unit:'packs'}],expl:'3 packs. The first shared total is 30 pencils: 30 ÷ 10 = 3 packs; 30 ÷ 6 = 5 pencils each.'}
];
const PR={};PRACTICE.forEach(p=>PR[p.id]=p);
/* ================= unit tests (generated) ================= */
const TESTS={
 1:[
  {id:'t1a',qt:'pv-value',q:'What is the value of the digit 9 in 14.096?',parts:[{spec:{t:'num',v:0.09}}],re:{q:'What is the value of the digit 4 in 3.024?',parts:[{spec:{t:'num',v:0.004}}]}},
  {id:'t1b',qt:'pv-regroup',q:'Complete: 0.457 = 0.3 + ? + 0.007',parts:[{spec:{t:'num',v:0.15}}],re:{q:'Complete: 0.629 = 0.5 + ? + 0.009',parts:[{spec:{t:'num',v:0.12}}]}},
  {id:'t1c',qt:'pv-scale',q:'Calculate 0.73 × 100',parts:[{spec:{t:'num',v:73}}],re:{q:'Calculate 5.1 × 1000',parts:[{spec:{t:'num',v:5100}}]}},
  {id:'t1d',qt:'pv-scale',q:'Calculate 3.6 ÷ 1000',parts:[{spec:{t:'num',v:0.0036}}],re:{q:'Calculate 45 ÷ 100',parts:[{spec:{t:'num',v:0.45}}]}},
  {id:'t1e',qt:'pv-reverse',q:'A number is divided by 100, then by 10. The result is 0.09. What was the start number?',parts:[{spec:{t:'num',v:90}}],re:{q:'A number is multiplied by 10, then by 100. The result is 7. What was the start number?',parts:[{spec:{t:'num',v:0.007}}]}},
  {id:'t1f',qt:'rd-line',q:'Round 4.96 to the nearest tenth.',parts:[{spec:{t:'num',v:5,dp:1}}],re:{q:'Round 9.97 to the nearest tenth.',parts:[{spec:{t:'num',v:10,dp:1}}]}},
  {id:'t1g',qt:'rd-line',q:'Round 2.348 to the nearest tenth.',parts:[{spec:{t:'num',v:2.3,dp:1}}],re:{q:'Round 5.649 to the nearest tenth.',parts:[{spec:{t:'num',v:5.6,dp:1}}]}},
  {id:'t1h',qt:'rd-range',q:'What is the largest number with exactly 2 decimal places that rounds to 6.5 (nearest tenth)?',parts:[{spec:{t:'num',v:6.54,dp:2}}],re:{q:'What is the smallest number with exactly 2 decimal places that rounds to 4.2 (nearest tenth)?',parts:[{spec:{t:'num',v:4.15,dp:2}}]}},
  {id:'t1i',qt:'rd-line',q:'Round 3450 ml to the nearest litre.',parts:[{spec:{t:'num',v:3},unit:'litres'}],re:{q:'Round 7500 ml to the nearest litre.',parts:[{spec:{t:'num',v:8},unit:'litres'}]}}
 ],
 2:[
  {id:'t2a',qt:'sq-jumps',q:'A sequence starts at 1.5 and adds 0.3. Find the 8th term.',parts:[{spec:{t:'num',v:3.6}}],re:{q:'A sequence starts at 0.6 and adds 0.7. Find the 6th term.',parts:[{spec:{t:'num',v:4.1}}]}},
  {id:'t2b',qt:'sq-missing',q:'Complete: 5, ?, ?, ?, 25',parts:[{label:'2nd',spec:{t:'num',v:10}},{label:'3rd',spec:{t:'num',v:15}},{label:'4th',spec:{t:'num',v:20}}],re:{q:'Complete: 3, ?, ?, ?, ?, 23',parts:[{label:'2nd',spec:{t:'num',v:7}},{label:'3rd',spec:{t:'num',v:11}},{label:'4th',spec:{t:'num',v:15}},{label:'5th',spec:{t:'num',v:19}}]}},
  {id:'t2c',qt:'sq-rules',q:'The position-to-term rule is “multiply by 7”. Find the 12th term.',parts:[{spec:{t:'num',v:84}}],re:{q:'The position-to-term rule is “multiply by 8”. Find the 11th term.',parts:[{spec:{t:'num',v:88}}]}},
  {id:'t2d',qt:'sq-missing',q:'Can 50 be a term of 3, 7, 11, 15, …?',parts:[{spec:{t:'choice',opts:['yes','no'],v:'no'}}],re:{q:'Can 43 be a term of 3, 7, 11, 15, …?',parts:[{spec:{t:'choice',opts:['yes','no'],v:'yes'}}]}},
  {id:'t2e',qt:'sc-square',q:'Find 6².',parts:[{spec:{t:'num',v:36}}],re:{q:'Find 8².',parts:[{spec:{t:'num',v:64}}]}},
  {id:'t2f',qt:'sc-cube',q:'Find 5³.',parts:[{spec:{t:'num',v:125}}],re:{q:'Find 2³.',parts:[{spec:{t:'num',v:8}}]}},
  {id:'t2g',qt:'sc-sort',q:'Which number is both a square number and a cube number?',parts:[{spec:{t:'choice',opts:['36','64','100'],v:'64'}}],re:{q:'Which number is both a square number and a cube number?',parts:[{spec:{t:'choice',opts:['16','27','1'],v:'1'}}]}},
  {id:'t2h',qt:'mf-factor',q:'List all common factors of 16 and 24.',parts:[{spec:{t:'set',v:[1,2,4,8]},ph:'e.g. 1, 2'}],re:{q:'List all common factors of 20 and 30.',parts:[{spec:{t:'set',v:[1,2,5,10]},ph:'e.g. 1, 2'}]}},
  {id:'t2i',qt:'mf-multiple',q:'Two lights flash every 4 and 6 seconds. They flash together now. When do they next flash together?',parts:[{spec:{t:'num',v:12},unit:'seconds'}],re:{q:'Two lights flash every 3 and 5 seconds. They flash together now. When do they next flash together?',parts:[{spec:{t:'num',v:15},unit:'seconds'}]}},
  {id:'t2j',qt:'mf-packs',q:'Stickers come in packs of 6. What is the smallest number of packs that can be shared equally among 4 children?',parts:[{spec:{t:'num',v:2},unit:'packs'}],re:{q:'Stickers come in packs of 4. What is the smallest number of packs that can be shared equally among 6 children?',parts:[{spec:{t:'num',v:3},unit:'packs'}]}}
 ]
};
const TI={};Object.values(TESTS).flat().forEach(t=>TI[t.id]=t);
/* ================= marking ================= */
function parseNum(raw){
  let s=String(raw==null?'':raw).trim().replace(/[−–]/g,'-');
  s=s.replace(/(\d)[\s,](?=\d{3}(\D|$))/g,'$1').replace(/(\d)[\s,](?=\d{3}(\D|$))/g,'$1');
  s=s.replace(/\s*[a-zA-Z]+\.?$/,'').trim();
  if(!/^-?(\d+\.?\d*|\.\d+)$/.test(s))return null;
  return{n:parseFloat(s),dp:(s.split('.')[1]||'').length};
}
const near=(a,b)=>Math.abs(a-b)<1e-9;
const normT=s=>String(s).toLowerCase().replace(/[−–]/g,'-').replace(/[\s×*x]/g,'').replace(/^term=/,'');
function mark(spec,raw){
  if(spec.t==='open')return{pending:true};
  if(raw==null||String(raw).trim()==='')return{ok:false,msg:'No answer.'};
  if(spec.t==='num'){const p=parseNum(raw);if(!p)return{ok:false,msg:'Write a number.'};
    if(!near(p.n,spec.v))return{ok:false};
    if(spec.dp!=null&&p.dp!==spec.dp)return{ok:false,msg:spec.dp===0?'Right size, but write it as a whole number.':`Right size — now write it with exactly ${spec.dp} decimal place${spec.dp>1?'s':''}.`};
    return{ok:true}}
  if(spec.t==='set'){const a=[...new Set(String(raw).replace(/[−–]/g,'-').split(/[^0-9.\-]+/).filter(x=>x&&x!=='.'&&x!=='-').map(Number))].sort((x,y)=>x-y);const b=[...spec.v].sort((x,y)=>x-y);
    return{ok:a.length===b.length&&a.every((x,i)=>near(x,b[i])),msg:a.length<b.length?'Some are missing.':a.length>b.length?'Some numbers are not common factors.':''}}
  if(spec.t==='sum'){const ps=String(raw).split('+').map(parseNum);if(ps.some(p=>!p))return{ok:false,msg:'Write parts joined with +.'};
    const a=ps.map(p=>p.n).sort((x,y)=>x-y),b=[...spec.v].sort((x,y)=>x-y);return{ok:a.length===b.length&&a.every((x,i)=>near(x,b[i]))}}
  if(spec.t==='text'){return{ok:spec.v.map(normT).includes(normT(raw))}}
  if(spec.t==='choice'){return{ok:raw===spec.v}}
  return{ok:false};
}
const ansText=spec=>spec.t==='num'?(spec.dp!=null?Number(spec.v).toFixed(spec.dp):String(spec.v)).replace('-','−'):spec.t==='set'?spec.v.join(', '):spec.t==='sum'?spec.v.join(' + '):spec.t==='text'?spec.v[0].replace(/n/,'n '):spec.t==='choice'?spec.v:'(see model answer)';

function partsHTML(item,pref,opts={}){
  return item.parts.map((p,i)=>{const id=`${pref}-${i}`,lab=p.label?`<label for="${id}">${esc(p.label)}</label>`:'';
    const val=opts.values?opts.values[i]:'';
    if(p.spec.t==='open')return`<div class="part" style="display:block">${lab}<textarea id="${id}" placeholder="Write your explanation in English">${esc(val||'')}</textarea></div>`;
    if(p.spec.t==='choice')return`<div class="part">${lab}<select id="${id}"><option value="">Choose…</option>${p.spec.opts.map(o=>`<option ${val===o?'selected':''}>${esc(o)}</option>`).join('')}</select><span class="mark" id="${id}-m"></span></div>`;
    return`<div class="part">${lab}<input type="text" id="${id}" value="${esc(val||'')}" autocomplete="off" ${p.spec.t==='num'?'inputmode="decimal"':''} placeholder="${esc(p.ph||'Answer')}">${p.unit?`<span class="muted">${esc(p.unit)}</span>`:''}<span class="mark" id="${id}-m"></span></div>`}).join('');
}
function readParts(item,pref){return item.parts.map((p,i)=>{const e=document.getElementById(`${pref}-${i}`);return e?e.value:''})}
function showMarks(item,pref,res){res.forEach((r,i)=>{const e=document.getElementById(`${pref}-${i}`);if(!e)return;const box=e.closest('.part');box.classList.remove('ok','bad');if(r.pending)return;box.classList.add(r.ok?'ok':'bad');const m=document.getElementById(`${pref}-${i}-m`);if(m)m.innerHTML=(r.ok?'<span style="color:var(--ok)">✓</span>':'<span style="color:var(--bad)">✗</span>')+(r.msg?` <span class="small muted">${esc(r.msg)}</span>`:'')})}
function markItem(item,vals){const res=item.parts.map((p,i)=>mark(p.spec,vals[i]));const pending=res.some(r=>r.pending);const ok=!pending&&res.every(r=>r.ok);return{res,ok,pending}}
const GUIDE={
 'pv-value':{p:2,t:'Place value',s:'Same digit? Different place. Different value.',ref:'LB pp. 12–14; WB pp. 9–11. Number 47.506 from WB p. 10.'},
 'pv-regroup':{p:3,t:'Regroup a decimal',s:'Trade one tenth for ten hundredths.',ref:'LB p. 14, Q4–6; WB pp. 9–10. 0.546 regrouping example.'},
 'pv-scale':{p:4,t:'Shift the digits',s:'× 100: two places left. ÷ 100: two places right.',ref:'LB p. 14, Q7–8; WB pp. 10–12, loops and function machines.'},
 'pv-reverse':{p:5,t:'Reverse the machine',s:'Start at the answer. Undo the last step first.',ref:'WB p. 8, worked example and p. 13, Q14; LB p. 14, Q9.'},
 'rd-line':{p:6,t:'Round on a number line',s:'Nearest tenth · halfway rounds up.',ref:'LB pp. 16–17; WB pp. 15–16. Examples 7.81 and 3.95.'},
 'rd-range':{p:7,t:'Find the range',s:'Exactly two decimal places.',ref:'LB pp. 18–19, ranges and perimeter; WB p. 17, Q8 and p. 19, capacity.'},
 'sq-jumps':{p:8,t:'Count the jumps',s:'Term 1 is the starting point.',ref:'LB p. 25 and p. 34, Q1; WB pp. 22–25. Decimal and fraction steps.'},
 'sq-rules':{p:9,t:'Connect position to term',s:'Two ways to travel through a sequence.',ref:'LB pp. 22–24; WB pp. 22–25. General constant-step rule shown visually.'},
 'sq-picture':{p:10,t:'A picture can be a rule',s:'Count one repeating unit, then build the pattern.',ref:'WB p. 21, rockets; LB pp. 22–24, flow diagrams.'},
 'sq-missing':{p:11,t:'Find the missing terms',s:'Divide the total change by the number of gaps.',ref:'WB p. 25, Q13; LB pp. 25–26, membership and crossing a target.'},
 'sc-square':{p:12,t:'Square numbers',s:'Equal rows and columns.',ref:'LB pp. 27–29; WB pp. 27–30. Square arrays and square-number sum puzzles.'},
 'sc-cube':{p:13,t:'Cube numbers',s:'Rows × columns × layers.',ref:'LB pp. 27–28; WB p. 30, Q13. Three layers of nine; sixteen cubes in the base.'},
 'sc-sort':{p:14,t:'Sort the special numbers',s:'Use the overlap for numbers in both groups.',ref:'WB p. 29, Q9–10; p. 26, digit-card worked example. LB p. 29, Carroll diagrams.'},
 'mf-multiple':{p:15,t:'Meet again',s:'A shared landing point is a common multiple.',ref:'LB pp. 30–32; WB pp. 32 and 35. Light every 4 minutes; bell every 5 minutes.'},
 'mf-factor':{p:16,t:'Find the common factors',s:'A factor makes equal rows with nothing left over.',ref:'LB p. 32, Q5–7; WB pp. 31 and 33–34. Factors of 24; common factors of 18 and 24.'},
 'mf-packs':{p:17,t:'Packs or equal groups?',s:'Whole packs build up. Equal groups break down.',ref:'WB p. 35, Q10–12; LB p. 32. Cakes in packs of 8; 56 mangoes and 49 peaches.'}
};
const INVEST={
 '1.1':{p:19,t:'Investigate · Branch out',s:'Count levels, then subtract the parts removed.',ref:'LB p. 15, Numberland Woods; p. 33, factor-or-multiple chains.'},
 '2.2':{p:18,t:'Investigate · Grow a square',s:'Every new L-shaped border adds an odd number.',ref:'LB pp. 29 and 35, Project 1; p. 26, hexagonal numbers.'}
};
/* skills found in exam questions that have no page in the Guide */
const EXTRA={'pv-order':{sub:'1.1',t:'Order and compare decimals'},'mf-prime':{sub:'2.3',t:'Prime numbers'}};
const SUBCOL={'1.1':['#efeaf8','#6b46a8'],'1.2':['#e7f0fb','#2f5bd3'],'2.1':['#e4f5ee','#0f8a6a'],'2.2':['#fff1e2','#b85a1a'],'2.3':['#fcebf2','#b8336a']};
const skillTitle=k=>GUIDE[k]?`${QT[k].sub} · ${GUIDE[k].t}`:EXTRA[k]?`${EXTRA[k].sub} · ${EXTRA[k].t}`:k;
const skillSub=k=>QT[k]?QT[k].sub:EXTRA[k].sub;

function guideCard(id,opt={}){
  const g=GUIDE[id],q=QT[id],col=SUBCOL[q.sub][1];
  return `<article class="gcard ${opt.small?'small':''}" style="--gc:${col}">
   <div class="gk">CAMBRIDGE PRIMARY MATHEMATICS · STAGE 6</div>
   <h2 class="gt">${q.sub} · ${esc(g.t)}</h2><div class="gs">${esc(g.s)}</div><hr>
   <img class="gimg" src="${VIMG[g.p]}" alt="${esc(q.ex.q+' '+q.ex.steps.join(' '))}">
   <div class="gref">${esc(g.ref)}</div><div class="gfoot"><span>UNITS 1 &amp; 2 · VISUAL METHODS</span><b>${String(g.p).padStart(2,'0')}</b></div></article>`;
}
function investCard(s){const g=INVEST[s];if(!g)return'';
  return `<article class="gcard small" style="--gc:${SUBCOL[s][1]}"><div class="gk">CAMBRIDGE PRIMARY MATHEMATICS · STAGE 6</div><h2 class="gt">${esc(g.t)}</h2><div class="gs">${esc(g.s)}</div><hr><img class="gimg" src="${VIMG[g.p]}" alt="${esc(g.t)}"><div class="gref">${esc(g.ref)}</div><div class="gfoot"><span>UNITS 1 &amp; 2 · VISUAL METHODS</span><b>${g.p}</b></div></article>`}

