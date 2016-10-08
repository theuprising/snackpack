const removeFirstN = n => compose(
  join(path.sep),
  remove(0, n),
  split(path.sep)
)

const resolveGlobs = compose(
  map(removeFirstN(3)),
  reduce(concat, []),
  map(glob.sync)
)


