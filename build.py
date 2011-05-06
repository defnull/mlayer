import os, re, sys

def combine(filename, skiplist):
    if not filename.endswith('.js'): return ''
    if os.path.basename(filename).startswith('.'): return ''
    if filename in skiplist: return ''
    with open(filename) as fp:
        sys.stderr.write('Reading %r\n' % filename)
        source = ''
        for line in fp:
            req = re.search('REQUIRE ([a-zA-Z\\.]+)', line)
            if req:
                req = os.path.join(os.path.dirname(filename), req.group(1))
                source += combine(req, skiplist)
            else:
                source += line
        skiplist.append(filename)
        return source
 
def main():
    source = ''
    skiplist = []
    for filename in sys.argv[1:]:
        source += combine(filename, skiplist)
    print source

if __name__ == '__main__':
    main()
