import json,re,random
P=json.load(open('data/papers.json'))
R=[
('5.3',r'rotational symmetry|order of rotation'),
('17.2',r'reflect|mirror line|reflection'),
('17.3',r'\brotat|quarter turn|half turn|clockwise'),
('17.1',r'coordinate|translat|\bplot\w* the point|\(\s*[−-]?\d+\s*,\s*[−-]?\d+\s*\)'),
('9.1',r'probabilit|likely|chance|at random|spinner|\bdice\b|mutually exclusive|outcome|impossible|\bcertain\b|experiment'),
('3.1',r'\bmean\b|\bmedian\b|\bmode\b|\brange\b|average'),
('15.2',r'frequency|grouped|line graph|scatter|pie chart|waffle|line of best fit|connection between|correlation|dot plot'),
('13.2',r'angles? in a triangle|isosceles|equilateral|scalene|triangle.{0,80}angle|angle.{0,80}triangle'),
('13.1',r'\bangle|protractor|°|acute|obtuse|reflex'),
('5.2',r'circle|radius|diameter|circumference|compasses'),
('11.2',r'capacity|volume|litre|\bml\b'),
('11.1',r'\bnets?\b|cube(?! number)|cuboid|prism|pyramid|3D|faces|edges|vertices|surface area'),
('5.1',r'quadrilateral|parallelogram|rhombus|trapezium|\bkite|rectangle|diagonal|parallel|perpendicular|polygon'),
('7.2',r'\bhours?\b|\bminutes?\b|\bseconds?\b|clock|timetable|time zone|\d{2}:\d{2}'),
('7.1',r'\barea\b|perimeter|cm2|cm²|m²'),
('15.1',r'bar chart|Carroll|Venn|tally|pictogram|\bchart\b|\bgraph\b|survey|collects? data|representation'),
('12.1',r'\bratio\b'),
('12.2',r'recipe|proportion|for every|\bscale\b|exchange rate|each costs|cost of'),
('6.2',r'percent|%'),
('2.2',r'square numbers?|cube numbers?|squared|cubed|[²³]'),
('10.3',r'divisible|divisibility'),
('2.1',r'sequence|\bterms?\b|pattern|\brule\b'),
('2.3',r'multiple|factor|prime'),
('16.1',r'bracket|order of operations|\([^)]*[+−×÷-][^)]*\)\s*[×÷]|[×÷]\s*\('),
('4.2',r'letters?\b|represents? the|expression|formula|\b[a-z]\s*[+=−]\s*\w|\bstands for'),
('1.2',r'round|nearest|estimate|approximate'),
('6.3',r'equivalent|simplest form|in order of size.*\d/\d|compare'),
('14.1',r'\d\s*/\s*\d+\s*[×÷]|[×÷]\s*\d+\s*/\s*\d'),
('8.2',r'\d\s*/\s*\d+\s*[+−-]\s*\d|fraction.{0,40}(add|subtract|altogether|left)'),
('6.1',r'fraction|numerator|denominator|mixed number|improper|shaded|\d/\d'),
('14.3',r'\d\.\d+\s*÷|÷\s*\d+\.\d'),
('14.2',r'\d\.\d+\s*×|×\s*\d+\.\d'),
('8.1',r'\d\.\d+\s*[+−-]|[+−-]\s*\d+\.\d|decimal.{0,40}(add|subtract|total|difference)|total length|total mass|how much more'),
('4.1',r'negative|temperature|[−-]\d|integer|million|°C'),
('10.2',r'÷|divide|share|remainder|each (box|bag|group)'),
('10.1',r'×|multipl|product|times'),
('1.1',r'place value|digit|tenths|hundredths|thousandths|represents|value of|decimal'),
]
T={}
for p in P:
  for q in p['qs']:
    t=q['text'].replace('\n',' ')
    # drop the leading "N " question number
    k='1.1'
    for s,r in R:
      if re.search(r,t,re.I if s not in('4.2',) else 0):k=s;break
    T[f"{p['id']}-{q['n']}"]=k
json.dump(T,open('data/topics.json','w'))
from collections import Counter;print(sorted(Counter(T.values()).items(),key=lambda x:[int(a) for a in x[0].split('.')]))
