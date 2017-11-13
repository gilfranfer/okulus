okulusApp.controller('LanguageCntrl', ['$routeParams', '$rootScope',
	function($routeParams, $rootScope){
		$rootScope.config ={
			bday:{maxDate:"2017-12-31",minDate:"1900-01-01"},
			reports:{maxDate:"2018-12-31",minDate:"2017-01-01"}
		};
		$rootScope.i18n = {
			navigation:{
				brand:"Okulus",
				home:"Inicio",
				admin:{
					menuTitle:"Admin",
					launchpad:"Escritorio",
					orgDetails:"Ver Organizacion", newGroup:"Crear Grupo",
					newMember:"Crear Miembro", newReport:"Crear Reporte"
				}
			},
			launchpad:{
				orgCardTitle: "Organizacion", orgCardDesc: "Editar los datos de la Organizacion",
				newgroupCardTitle:"Nuevo Grupo",newgroupCardDesc:"Crear un nuevo Grupo Familiar",
				newmemberCardTitle:"Nuevo Miembro",newmemberCardDesc:"Crear un nuevo Miembro",
				newreportCardTitle:"Nuevo Reporte",newreportCardDesc:"Crear un nuevo Reporte de Reunion"
			},
			reportForm:{
				reportLegend:"Datos generales de la Reunion",
				gnameLbl:"Grupo", gnamePlaceholder:"",
				gidLbl: "Identificador", gidPlaceholder: "",
				lnameLbl: "Lider", lnamePlaceholder: "",
				anameLbl: "Asistente", anamePlaceholder: "",
				hnameLbl: "Anfitrion", hnamePlaceholder: "",
				dateLbl: "Fecha de reunion", datePlaceholder: "12/22/2017",
				startTimeLbl: "Hora de Inicio", startTimePlaceholder: "12:00 p.m.",
				endTimeLbl: "Hora de Fin", endTimePlaceholder: "2:00 p.m.",
				weekLbl:"Semana", moneyLbl: "Ofrenda",
				cancelStatusLbl:"Cancelada", okStatusLbl:"Realizada",
				notesLegend: "Notas", notesPlaceholder: "Agregar notas y comentarios de la reunion",
				attendanceLegend: "Asistencia",
				membersLbl: "Miembros", guestsLbl: "Invitados",
				maleLbl: "Hombres", femaleLbl: "Mujeres",
				maleAbrev: "Hom", femaleAbrev: "Muj",
				adultLbl: "Adultos", youngLbl:"Jovenes", kidLbl:"Niños",
				studyLegend: "Estudio", studyLbl: "Titulo", seriesLbl: "Serie"

			},
			groupForm:{
				basicInfoFieldset: "Datos del Grupo",
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
				basicInfoFieldset: "Datos de la Organizacion",
				orgnameLabel:"Nombre de la Organizacion", orgNamePlaceholder: "Mi Organizacion", orgnameAlert: "El nombre es obligatorio",
				emailLabel:"Correo electronico", emailPlaceholder:"micorreo@gmail.com", emailAlert:"El correo es obligatorio",
				urlLabel:"Sitio Web", urlPlaceholder:"http://www.misitio.com", urlAlert:"Sitio web incorrecto"
			},
			memberForm:{
				fieldsetLegend: "Datos del miembro",
				fnameLabel:"Nombre", fnamePlaceholder:"Mi nombre",
				lnameLabel:"Apellido", lnamePlaceholder:"Mi apellido",
				emailLabel:"Corre electronico", emailPlaceholder:"micorreo@gmail.com",
				phoneLabel:"Telefono", phonePlaceholder:"+52 (228) 8112233",
				bday:"Fecha de nacimiento"
			},
			phonesForm:{
				phonesFieldset: "Telefonos",
				addphoneBtn: "Agregar Telefono"
			},
			btns:{
				saveBtn: "Guardar Cambios",
				cancelBtn: "Cancelar",
				sendBtn: "Enviar"
			},
			dropdowns:{
				status:{
					label: "Estado",
					inactive: "Inactivo",
					active: "Activo"
				},
				weekdays:{
					mon:"Lunes", tue:"Martes", wed:"Miercoles", thu:"Jueves",
					fri:"Viernes", sat:"Sabado", sun:"Domingo"
				},
				gtype:{
					mix:"Mixto", men:"Hombres",women:"Mujeres",young:"Jovenes",pilot:"Piloto"
				}
			},
			schd:{
				fieldsetLegend:"Horario de Servicio"
			}
		};

	}
]);
