const stationsNjcl = {
  s1: "New York, Secaucus Junction, Newark Penn, Newark Airport, Linden, Rahway, Avenel Woodbridge, Perth Amboy, South Amboy, Aberdeen-Matawan Hazlet Middletown, Redbank, Little Silver, Monmouth Park (Summer Only), Elberon, Allenhurst, Asbury Park, Bradley Beach, Belmar, Spring Lake, Manasquan, Point Pleasent, Bayhead (Termination)",
};
//let njclShowStationList = document.getElementById(stationsNjcl.s1);

const stationShower = function () {
  let njclB = document.getElementById("njclB");
};
const njclShowStation = function () {
  console.log(stationsNjcl.s1);
  njclShowStationList.innerHTML =
    "<b>New York </b> - Amtrak, LIRR, NYC Subway <br/> <b> Secaucus Junction </b> <br/> <b> Newark Penn </b> - Amtrak, PATH Train <br/> Newark Airport - Amtrak, Airtrain <br/> North Elizabeth <br/> Elizabeth <br/> Linden <br/> Rahway <br/><br/><span class='pBeginLine'><i>North Jersey Coast Line Begins <br/> Leave Northeast Corridor</i> </span> <br/><br/> Avenel <br/> <b> Woodbridge </br> Perth Amboy <br/> South Amboy </b> <br/> Aberdeen-Matawan <br/> Hazlet <br/> Middletown <br/> Redbank <br/> Little Silver <br/> Monmouth Park - Summer Only <br/> <b> Long Branch </b> <br/> <br/> <span class='pLimitedService'>Catenary Wires End <br/> Limited Service</span> <br/> <br/> Elberon <br/> Allenhurst <br/> Asbury Park <br/> Bradley Beach <br/> Belmar <br/> Spring Lake <br/> Manasquan <br/> Point Pleasent <br/> Bayhead";
};

const njclHideStation = function () {
  console.log("hiding stations NJCL");
  njclShowStationList.innerText = "";
};

//let necB = document.getElementById("necB");

const stationsNEC = {
  s1: "New York, Secaucus Junction, Newark Penn, Newark Airport, Linden, Rahway, Metropark, Metuchen, Edison, New Brunswick, Jersey Avenue, Princeton Junction, Hamilton, Trenton Transit Center",
};

const necHideStation = function () {
  console.log("hiding stations NEC");
  necShowStationList.innerText = "";
};
const stationShowerB = function () {
  let necB = document.getElementById("necB");
};
const necShowStation = function () {
  console.log(stationsNEC.s1);
  necShowStationList.innerHTML =
    "<b>New York </b> - Amtrak, LIRR, NYC Subway <br/> <b> Secaucus Junction </b> <br/> <b> Newark Penn </b> - Amtrak, PATH Train <br/> Newark Airport - Amtrak, Airtrain <br/> North Elizabeth <br/> Elizabeth <br/> Linden <br/> Rahway <br/> Metropark - Amtrak <br/> Metuchen <br/> Edison <br/> <b> New Brunswick </b> - Amtrak <br/> Jersey Avenue - <span class='pLimitedService'><i> Terminus for Some Trains </i></span> <br/> <b> Princeton Junction </b> - Amtrak, Princeton Branch <br/> <b> Hamilton </b> <br/> <b> Trenton Transit Center </b> - Amtrak, NJ Transit River Line, Septa";
};

// Raritain Valley Line

const stationsRVL = {
  s1: "[New York, Secaucus Junction] - off peak, Newark Penn, Union, Roselle Park, Cranford, Garwood, Westfield, Fanwood, Netherwood, Plainfield, Dullwn, Bound Brook, Bridgewater, Sommerville, Raritain, North Branch, Whitehouse Station, Lebanon, Annadale, High Bridge",
};

const RVLHideStation = function () {
  console.log("hiding stations RVL");
  RVLShowStationList.innerText = "";
};
const stationShowerC = function () {
  let RVLB = document.getElementById("RVLB");
};
const RVLShowStation = function () {
  console.log(stationsRVL.s1);
  RVLShowStationList.innerHTML =
    "<span class='pLimitedService'><i> New York </i> - <u>OFF PEAK</u></span> -  Amtrak, LIRR, NYC Subway <br/> <span class='pLimitedService'><i> Secaucus Junction </i>- <u>OFF PEAK</u> </span> <br/> <b> Newark Penn </b> - Amtrak, PATH Train <br/> Union <br/> Roselle Park <br/> Cranford <br/> Garwood <br/> Westfield <br/> Fanwood <br/> Netherwood <br/> Plainfield <br/> Dullwn <br/> Bound Brook <br/> Bridgewater <br/> <b> Sommerville </b> <br/> <b> Raritain </b> <br/> <br/> <span class='pLimitedService'> Limited Service </span> <br/> <br/> North Branch <br/> Whitehouse Station <br/> Lebanon <br/> Annadale <br/> High Bridge";
};

//Montclair-Boonton Line

const stationsMB = {
  s1: "Hoboken, Newark Broad Street Station, Watsessing, Bloomfield, Glen Ridge, Bay Street, Walnut Street, Watchung Ave, Upper Montclair, Mountain Ave, Montclair Heights, Montclair State University, Little Falls, Wayne Rt. 23, Mountain View Wayne, Lincoln Park, Towaco, Boonton, Mountain Lakes, Denville, Dover, Mount Arlington, Lake Hopatcong, Netcong, Mount Olive, Hackettstown",
};

const MBHideStation = function () {
  console.log("hiding stations MB");
  MBShowStationList.innerText = "";
};
const stationShowerD = function () {
  let MB = document.getElementById("MBB");
};
const MBShowStation = function () {
  console.log(stationsMB.s1);
  MBShowStationList.innerHTML =
    "<b> Hoboken </b> - PATH Train <br/> <b> Newark Broad Street Station </b> - Newark Light Rail <br/> Watsessing <br/> Bloomfield <br/> Glen Ridge <br/> <b> Bay Street </b> <br/> Walnut Street <br/> <b> Watchung Ave </b> <br/> Upper Montclair <br/> Mountain Ave <br/> Montclair Heights <br/> Montclair State University <br/> <br/> <span class='pLimitedService'>Catenary Wires End <br/> Limited Service</span> <br/> <br/> Little Falls <br/> Wayne Rt. 23 <br/> Mountain View Wayne <br/> Lincoln Park <br/> Towaco <br/> Boonton <br/> Mountain Lakes <br/><br/> <span class='pBeginLine'><i>Join With <u>Morristown Line</i></u></span> <br/><br/> Denville <br/> Dover <br/> Mount Arlington <br/> Lake Hopatcong <br/> Netcong <br/> Mount Olive <br/> Hackettstown";
};

//Gladstone Branch Line

const stationsGS = {
  s1: "Hoboken, Newark Broad Street, East Orange, Brick Church, Orange, Highland Avenue, Mountain Station, South Orange, Maplewood, Millburn, Short Hills, Summit, New Providence, Murray Hill, Berkeley Heights, Gillette, Stirling, Milington, Lyons, Basking Ridge, Bernardsville, FarHills, Peapack, Gladstone",
};

const GSHideStation = function () {
  console.log("hiding stations GS");
  GSShowStationList.innerText = "";
};
const stationShowerE = function () {
  let GS = document.getElementById("GSB");
};
const GSShowStation = function () {
  console.log(stationsGS.s1);
  GSShowStationList.innerHTML =
    "<b>Hoboken</b> - PATH TRAIN <br/> <b> Newark Broad Street </b> - Newark Light Rail <br/> East Orange <br/> Brick Church <br/> Orange <br/> Highland Avenue <br/> <b>Mountain Station <br/> South Orange</b> <br/> Maplewood <br/> Millburn <br/> Short Hills <br/> Summit <br/><br/> <span class='pBeginLine'><i>Gladstone Branch Begins</i></span> <br/><br/> New Providence <br/> Murray Hill <br/> Berkeley Heights <br/> Gillette <br/> Stirling, Milington <br/> Lyons <br/> Basking Ridge <br/> Bernardsville <br/> FarHills <br/> Peapack <br/> Gladstone";
};

//Morristown Line

const stationsMT = {
  s1: "Hoboken, Newark Broad Street, East Orange, Brick Church, Orange, Highland Avenue, Mountain Station, South Orange, Maplewood, Millburn, Short Hills, Summit, Chatham, Madison, Convent Station, Morristown, Morris Plains, Mount Tabor, Denville, Dover, Mount Arlington, Lake Hopatcong, Netcong, Mount Olive, Hackettstown",
};

const MTHideStation = function () {
  console.log("hiding stations MT");
  MTShowStationList.innerText = "";
};
const stationShowerF = function () {
  let MT = document.getElementById("MTB");
};
const MTShowStation = function () {
  console.log(stationsMT.s1);
  MTShowStationList.innerHTML =
    "<b>Hoboken</b> - PATH TRAIN <br/> <b> Newark Broad Street </b> - Newark Light Rail <br/> East Orange <br/> Brick Church <br/> Orange <br/> Highland Avenue <br/> <b>Mountain Station <br/> South Orange</b> <br/> Maplewood <br/> Millburn <br/> Short Hills <br/> Summit <br/><br/> <span class='pBeginLine'><i>Morristown Branch Begins</i></span> <br/><br/>Chatham <br/> Madison <br/> Convent Station <br/> Morristown <br/> Morris Plains <br/> Mount Tabor <br/><br/> <span class='pBeginLine'><i>Join With <u>Montclair Boonton Line</u></i></span> <br/><br/> <b>Denville <br/> Dover</b> <br/> Mount Arlington <br/> Lake Hopatcong <br/> Netcong <br/> Mount Olive <br/> Hackettstown";
};

//Main Line

const stationsML = {
  s1: "Hoboken, Secaucus Junction, Kingsland, Lyndhurst, Delawanna Passaic, Clifton, Paterson, Glen Rock [Main Line], Ridgewood, Ho-Ho-Kus, Waldwick, Allendale, Ramsey, (Ramsey) Route 17, Mawhwah, Suffern [Port Jervis Line: Sloatsburg (NY), Tuxedo (NY), Harriman (NY), Salisbury Mills Cornwall (NY), Campbell Hall (NY), Middletown (NY), Otisville (NY) Port Jervis (NY)]",
};

const MLHideStation = function () {
  console.log("hiding stations ML");
  MLShowStationList.innerText = "";
};
const stationShowerG = function () {
  let ML = document.getElementById("MLB");
};
const MLShowStation = function () {
  console.log(stationsML.s1);
  MLShowStationList.innerHTML =
    "<b>Hoboken - Path Train <br/> Secaucus Junction</b> <br/> Kingsland <br/> Lyndhurst <br/> Delawanna Passai <br/> Clifton <br/> Paterson <br/> Glen Rock -<i>Main Line</i> <br/><br/> <span class='pBeginLine'><i>Join <u>Burgen County Line</i></u></span> <br/><br/> <b>Ridgewood</b> <br/> Ho-Ho-Kus <br/> Waldwick <br/> Allendale <br/> Ramsey <br/> (Ramsey) Route 17 <br/> Mawhwah <br/> <b>Suffern</b> (NY) <br/><br/> <span class='pBeginLine'><i><u>Port Jervis Line</u></span> <br/> <span class='pLimitedService'>Limited</span> / <span class='pBeginLine'><i>Express Service</i></span> <br/><br/> Sloatsburg (NY) <br/> Tuxedo (NY) <br/> Harriman (NY) <br/> Salisbury Mills Cornwall (NY) <br/> Campbell Hall (NY) <br/> Middletown (NY) <br/> Otisville (NY) <br/> Port Jervis (NY)";
};

//Bergen County Line

const stationsBCL = {
  s1: "Hoboken, Secaucus Junction, Rutherford, Westmont, Garfield, Plauderville, Broadway (Fair Lawn), Radburn (Fair Lawn), Glen Rock [Boro Hall], Ridgewood, Ho-Ho-Kus, Waldwick, Allendale, Ramsey, (Ramsey) Route 17, Mawhwah, Suffern [Port Jervis Line: Sloatsburg (NY), Tuxedo (NY), Harriman (NY), Salisbury Mills Cornwall (NY), Campbell Hall (NY), Middletown (NY), Otisville (NY) Port Jervis (NY)]",
};

const BCLHideStation = function () {
  console.log("hiding stations BCL");
  BCLShowStationList.innerText = "";
};
const stationShowerH = function () {
  let BCL = document.getElementById("BCLB");
};
const BCLShowStation = function () {
  console.log(stationsBCL.s1);
  BCLShowStationList.innerHTML =
    "<b>Hoboken</b> - PATH Train <br/> <b>Secaucus Junction</b> <br/> Rutherford <br/> Westmont <br/> Garfield <br/> Plauderville <br/> Broadway (Fair Lawn) <br/> Radburn (Fair Lawn) <br/> Glen Rock -<i>Boro Hall</i> <br/><br/> <span class='pBeginLine'><i>Join <u>Main Line</u></i></span> <br/><br/> <b>Ridgewood</b> <br/> Ho-Ho-Kus <br/> Waldwick <br/> Allendale <br/> Ramsey <br/> (Ramsey) Route 17 <br/> Mawhwah <br/> <b>Suffern</b> (NY) <br/><br/> <span class='pBeginLine'><i><u>Port Jervis Line</u></i></span> <br/> <span class='pLimitedService'>Limited</span> / <span class='pBeginLine'><i>Express Service</i></span> <br/><br/> Sloatsburg (NY) <br/> Tuxedo (NY) <br/> Harriman (NY) <br/> Salisbury Mills Cornwall (NY) <br/> Campbell Hall (NY) <br/> Middletown (NY) <br/> Otisville (NY) <br/> Port Jervis (NY) ";
};

//Pascack Valley Line

const stationsPVL = {
  s1: "Hoboken, Secaucus Junction, Wood-Ridge, Teterboro (Williams Ave), Anderson St (Hackensack), New Bridge Landing, River Edge, Oradell, Emerson, Westwood, Hillsdale, Woodcliff Lake, Park Ridge, Montvale, Pearl River (NY), Nanuet (NY), Spring Valley (NY)",
};

const PVLHideStation = function () {
  console.log("hiding stations PVL");
  PVLShowStationList.innerText = "";
};
const stationShowerI = function () {
  let PVL = document.getElementById("PVLB");
};
const PVLShowStation = function () {
  console.log(stationsPVL.s1);
  PVLShowStationList.innerHTML =
    "Hoboken - PATH Train <br/> Secaucus Junction <br/> Wood-Ridge <br/> Teterboro, <i>Williams Ave</i> <br/> Anderson St, <i>Hackensack</i> <br/> New Bridge Landing <br/> River Edge <br/> Oradell <br/> Emerson <br/> Westwood <br/> Hillsdale <br/> Woodcliff Lake <br/> Park Ridge <br/> Montvale <br/> Pearl River (NY) <br/> Nanuet (NY) <br/> Spring Valley (NY)";
};

//Atlantic City Line

const stationsACL = {
  s1: "Philadelphia 30th Street (PA), Pennsauken Transit Center, Cherry Hill, Lindenwold, Atco, Hammonton, Egg Harbor City, Absecon, Atlantic City Rail Terminal",
};

const ACLHideStation = function () {
  console.log("hiding stations ACL");
  ACLShowStationList.innerText = "";
};
const stationShowerJ = function () {
  let ACL = document.getElementById("ACLB");
};
const ACLShowStation = function () {
  console.log(stationsPVL.s1);
  ACLShowStationList.innerHTML =
    "Philadelphia 30th Street (PA) - Amtrak, Septa, Market-Frankfort Subway, Septa Subway Surface Trolley Lines <br/> Pennsauken Transit Center - NJ Trainsit River Line, PATCO Train <br/> Cherry Hill <br/> Lindenwold - PATCO Train <br/> Atco <br/> Hammonton <br/> Egg Harbor City <br/> Absecon <br/> Atlantic City Rail Terminal";
};

//City Subway LR

const stationsCSLR = {
  s1: "Newark Penn Station, Military PK, Washington St, Warren Street / NJIT, Norfolk St, Orange Street, Park Ave, Bloomfield Ave, Davenport Ave, Branch Brook Park, Silver Lake, Grove St",
};

const CSLRHideStation = function () {
  console.log("hiding stations CSLR");
  CSLRShowStationList.innerText = "";
};
const stationShowerK = function () {
  let CSLR = document.getElementById("CSLRB");
};
const CSLRShowStation = function () {
  console.log(stationsCSLR.s1);
  CSLRShowStationList.innerHTML =
    "Newark Broad Street Station - NJ Transit Hoboken Division Connections <br/> NJPAC <br/> Washington Park <br/> Orange St <br/> Newark Penn Station - Amtrak, NJ Transit New York Division Connections, PATH Train <br/><br/> <span class='pBeginLine'><i>Depart Newark Penn</i></span> <br/><br/> Newark Penn Station - Amtrak, NJ Transit New York Division Connections, PATH Train <br/> Military PK <br/> Washington St <br/> Warren Street / NJIT <br/> Norfolk St <br/> Orange Street <br/> Park Ave <br/> Bloomfield Ave <br/> Davenport Ave <br/> Branch Brook Park <br/> Silver Lak <br/> Grove St";
};

//Newark Penn to Broad Street Loop Light Rail [OBSLETE]

// const stationsNLR = {
//   s1: "Newark Broad Street Station, NJPAC, Washington Park, Orange St, Newark Penn Station",
//   s2: "Newark Broad Street Station, Stadium, Atlantic, Newark Penn Station",
// };

// const NLRHideStation = function () {
//   console.log("hiding stations NLR");
//   NLRShowStationList.innerText = "";
// };
// const stationShowerL = function () {
//   let NLR = document.getElementById("NLRB");
// };
// const NLRShowStation = function () {
//   console.log(stationsNLR.s1);
//   console.log(stationsNLR.s2);
//   NLRShowStationList.innerText =
//     "Newark Penn Station, NJPAC, Washington Park, Orange St, Newark Broad Street Station, \n \n Newark Broad Street Station, Stadium, Atlantic, Newark Penn Station ";
// };

// River Line Light Rail

const stationsRLLR = {
  s1: "Trenton Transit Center, Hamilton Ave, Cass St, Bordentown, Roebling, Florence, Burlington Towne Ctr, Burlington South, Beverly / Edgewater Park, Delanco, Riverside, Cinnaminson, Riverton, Palmyra, Pennsauken / Rt 73, Pennsauken Transit Center, 36 St, Walter Rand Transportation Center, Cooper St / Rutgers, Aquarium, Entertainment Ctr",
};

const RLLRHideStation = function () {
  console.log("hiding stations RLLR");
  RLLRShowStationList.innerText = "";
};
const stationShowerM = function () {
  let RLLR = document.getElementById("RLLRB");
};
const RLLRShowStation = function () {
  console.log(stationsRLLR.s1);
  RLLRShowStationList.innerHTML =
    "Trenton Transit Center - Amtrak, NJ Transit Northeasr Corridor Line, Septa <br/> Hamilton Ave <br/> Cass St <br/> Bordentown <br/> Roebling <br/> Florence <br/> Burlington Towne Ctr <br/> Burlington South <br/> Beverly / Edgewater Park <br/> Delanco <br/> Riverside <br/> Cinnaminson <br/> Riverton <br/> Palmyra <br/> Pennsauken / Rt 73 <br/> Pennsauken Transit Center - NJ Transit Atlantic City Line, PATCO Train <br/> 36 St <br/> Walter Rand Transportation Center <br/> Cooper St / Rutgers <br/> Aquarium <br/> Entertainment Ctr";
};

// document.addEventListener("hoverF", function () {
//   document.getElementById(njclB).addEventListener("mouseout", function () {
//     njclShowStationList.innerHTML =
//       "Opened in 1933 Under the <span class='pPRR'>Pennsylvania RailRoad</span>";
//   });
// });

necB.addEventListener("click", necShowStation);
njclB.addEventListener("click", njclShowStation);
RVLB.addEventListener("click", RVLShowStation);
MBB.addEventListener("click", MBShowStation);
GSB.addEventListener("click", GSShowStation);
MTB.addEventListener("click", MTShowStation);
MLB.addEventListener("click", MLShowStation);
BCLB.addEventListener("click", BCLShowStation);
PVLB.addEventListener("click", PVLShowStation);
ACLB.addEventListener("click", ACLShowStation);
CSLRB.addEventListener("click", CSLRShowStation);
//NLRB.addEventListener("click", NLRShowStation);
RLLRB.addEventListener("click", RLLRShowStation);

necB.addEventListener("dblclick", necHideStation);
njclB.addEventListener("dblclick", njclHideStation);
RVLB.addEventListener("dblclick", RVLHideStation);
MBB.addEventListener("dblclick", MBHideStation);
GSB.addEventListener("dblclick", GSHideStation);
MTB.addEventListener("dblclick", MTHideStation);
MLB.addEventListener("dblclick", MLHideStation);
BCLB.addEventListener("dblclick", BCLHideStation);
PVLB.addEventListener("dblclick", PVLHideStation);
ACLB.addEventListener("dblclick", ACLHideStation);
CSLRB.addEventListener("dblclick", CSLRHideStation);
// NLRB.addEventListener("dblclick", NLRHideStation);
RLLRB.addEventListener("dblclick", RLLRHideStation);
