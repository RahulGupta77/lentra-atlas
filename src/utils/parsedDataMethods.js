export function renameBankStatements(documents) {
  let count = 1;
  return documents.map((doc) => {
    if (doc.document_type === "Bank Statement") {
      return {
        ...doc,
        document_type: `Bank Statement - ${count++}`,
      };
    }
    return doc;
  });
}
