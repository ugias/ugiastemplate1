National Catholic Education Commission

Release notes for release $defname

Release Number : $($release.name)
Release completed $("{0:dd/MM/yy HH:mm:ss}" -f [datetime]$release.modifiedOn)

Builds

@@BUILDLOOP@@

$($build.definition.name)

Build Number : $($build.buildnumber)
build Summary : https://tfs-cecnsw.visualstudio.com/NETIDV3/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?definitionId=5&_a=releases
Build completed $("{0:dd/MM/yy HH:mm:ss}" -f [datetime]$build.finishTime)
Source Branch $($build.sourceBranch)

Associated work items

@@WILOOP@@

$($widetail.fields.'System.WorkItemType') $($widetail.id) [Assigned by: $($widetail.fields.'System.AssignedTo')] $($widetail.fields.'System.Title')

@@WILOOP@@

Associated change sets/commits

@@CSLOOP@@

ID $($csdetail.changesetid)$($csdetail.commitid)$($csdetail.id) $($csdetail.comment)

@@CSLOOP@@