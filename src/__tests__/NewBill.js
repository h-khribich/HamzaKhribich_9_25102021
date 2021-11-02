import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from '../constants/routes.js'
import firebase from "../__mocks__/firebase"
import Firestore from "../app/Firestore";


describe("Given I am connected as an employee on new bill page", () => {
  let newBill;
  beforeEach(() => {
    // Creating local storage and setting user type as employee
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: "Employee" }))
  })

  const html = NewBillUI()
  document.body.innerHTML = html
  newBill = new NewBill({
    document,
    onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
    firestore: null,
    localStorage: window.localStorage
  })

  describe("When I select a file", () => {
    test("Then it should added to the input", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const fileInput = screen.getByTestId("file")
      fileInput.addEventListener('change', handleChangeFile)
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["note-de-frais.jpg"], "note-de-frais.jpg", { type: "image/jpg"})]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(fileInput.files[0].name).toBe("note-de-frais.jpg")
    })
  })

  describe("When I submit the form", () => {
    test("Then a new bill should be created", () => {
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillForm = screen.getByTestId("form-new-bill")
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})