import sys
def is_net(cells):
    cells=set(cells)
    if len(cells)!=6:return False
    # roll a cube: track which face is down; faces as vectors
    start=next(iter(cells));seen={start:(0,0,-1)}
    # orientation state: map of directions -> normal; use rotation matrices
    import itertools
    def rot(o,d):
        # o: (down, north, east) normals
        dn,n,e=o
        neg=lambda v:tuple(-x for x in v)
        if d==(1,0): return (e,n,neg(dn))      # roll east
        if d==(-1,0): return (neg(e),n,dn)
        if d==(0,1): return (n,neg(dn),e)     # roll north
        if d==(0,-1): return (neg(n),dn,e)
    o0=((0,0,-1),(0,1,0),(1,0,0));st={start:o0};stack=[start]
    while stack:
        c=stack.pop()
        for d in [(1,0),(-1,0),(0,1),(0,-1)]:
            nb=(c[0]+d[0],c[1]+d[1])
            if nb in cells and nb not in st:
                st[nb]=rot(st[c],d);stack.append(nb)
    if len(st)!=6:return False
    return len({v[0] for v in st.values()})==6
if __name__=='__main__':
    base=eval(sys.argv[1])
    cand=set()
    for c in base:
        for d in [(1,0),(-1,0),(0,1),(0,-1)]:
            nb=(c[0]+d[0],c[1]+d[1])
            if nb not in base:cand.add(nb)
    ok=[c for c in sorted(cand) if is_net(base+[c])]
    print(len(ok),ok)
