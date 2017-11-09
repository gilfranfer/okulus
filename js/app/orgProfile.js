okulusApp.controller('OrgProfilenCntrl', ['$routeParams', '$rootScope',
	function($routeParams, $rootScope){
		$rootScope.i18n = {
			basicInfoFieldset: "Informacion Basica",
			orgnameLabel:"Nombre de la Organizacion", orgNamePlaceholder: "Mi Organizacion", orgnameAlert: "El nombre es obligatorio",
			emailLabel:"Correo Electronico", emailPlaceholder:"micorreo@gmail.com", emailAlert:"El correo es obligatorio",
			urlLabel:"Sitio Web", urlPlaceholder:"http://www.misitio.com", urlAlert:"Sitio web incorrecto", 
			
			addressFieldset: "Direccion principal",
			streetLabel:"Calle", streetPlaceholder:"Av. Principal",
			extNumberLabel: "Num ext", extNumberPlaceholder: "007",
			intNumberLabel: "Num int", intNumberPlaceholder: "1",
			zipLabel: "Codigo Postal", zipPlaceholder: "77777",
			cityLabel: "Ciudad", cityPlaceholder: "Xalapa",
			stateLabel: "Estado", statePlaceholder: "Veracruz",
			countryLabel: "Pais", countryPlaceholder: "Mexico",
			
			phonesFieldset: "Telefonos",
			addphoneBtn: "Agregar Telefono",
			saveBtn: "Guardar Cambios",
			cancelBtn: "Cancelar"

		};
	}
]);
