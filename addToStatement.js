module.exports = addToStatement;


function addToStatement (stmt, parentIndex, stmts) {
  var parent = stmts[parentIndex - 1];
  switch (stmt.elementType) {
    case 'ZestResponse':
      parent.response = stmt;
      break;

    default:

  }
}
