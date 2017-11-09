okulusApp.controller('LanguageCntrl', ['$routeParams', '$rootScope',
	function($routeParams, $rootScope){
		$rootScope.i18n = {
			launchpad:{
				orgCardTitle: "Organizacion", orgCardDesc: "Editar los datos de la Organizacion",
				newgroupCardTitle:"Nuevo Grupo",newgroupCardDesc:"Crear un nuevo Grupo Familiar"
			},
			groupForm:{
				basicInfoFieldset: "Detalles del Grupo",
				gnameLabel:"Nombre del Grupo", gNamePlaceholder:"Semillas de Esperanza",
				gtypeLabel:"Tipo", gstatusLabel:"Estado",
				schdDayLabel: "Dia de la semana",
				schdTimeFromLabel: "De" ,
				schdTimeToLabel: "a"
			},
			addressForm:{
				addressFieldset: "Direccion principal",
				streetLabel:"Calle", streetPlaceholder:"Av. Principal",
				extNumberLabel: "Num ext", extNumberPlaceholder: "007",
				intNumberLabel: "Num int", intNumberPlaceholder: "1",
				zipLabel: "Codigo Postal", zipPlaceholder: "77777",
				cityLabel: "Ciudad", cityPlaceholder: "Xalapa",
				stateLabel: "Estado", statePlaceholder: "Veracruz",
				countryLabel: "Pais", countryPlaceholder: "Mexico"
			},
			orgForm:{
				basicInfoFieldset: "Detalles de la Organizacion",
				orgnameLabel:"Nombre de la Organizacion", orgNamePlaceholder: "Mi Organizacion", orgnameAlert: "El nombre es obligatorio",
				emailLabel:"Correo Electronico", emailPlaceholder:"micorreo@gmail.com", emailAlert:"El correo es obligatorio",
				urlLabel:"Sitio Web", urlPlaceholder:"http://www.misitio.com", urlAlert:"Sitio web incorrecto"			
			},
			phonesForm:{
				phonesFieldset: "Telefonos",
				addphoneBtn: "Agregar Telefono"
			},
			btns:{
				saveBtn: "Guardar Cambios",
				cancelBtn: "Cancelar"
			},
			schd:{
				fieldsetLegend:"Horario de Servicio"
			}
		};
		
	}
]);
