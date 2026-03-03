import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type ProjectId = Text;
  type Filter = Text;
  type Threshold = Nat8;

  public type ChromaKey = {
    red : Threshold;
    green : Threshold;
    blue : Threshold;
    threshold : Threshold;
  };

  public type Project = {
    id : ProjectId;
    name : Text;
    filters : [Filter];
    chromaKey : ChromaKey;
    background : ?Storage.ExternalBlob;
  };

  let projects = Map.empty<Principal, Map.Map<ProjectId, Project>>();

  public shared ({ caller }) func createProject(projectId : ProjectId, name : Text) : async () {
    let project : Project = {
      id = projectId;
      name;
      filters = [];
      chromaKey = {
        red = 0;
        green = 255;
        blue = 0;
        threshold = 50;
      };
      background = null;
    };

    let userProjects = switch (projects.get(caller)) {
      case (null) {
        let newProjects = Map.empty<ProjectId, Project>();
        projects.add(caller, newProjects);
        newProjects;
      };
      case (?existingProjects) { existingProjects };
    };

    if (userProjects.containsKey(projectId)) {
      Runtime.trap("Project with this ID already exists");
    };
    userProjects.add(projectId, project);
  };

  public shared ({ caller }) func addFilter(projectId : ProjectId, filter : Filter) : async () {
    let userProjects = getUserProjects(caller);
    let project = fetchProject(userProjects, projectId);
    let updatedFilters = project.filters.concat([filter]);
    let updatedProject = {
      project with filters = updatedFilters;
    };
    userProjects.add(projectId, updatedProject);
  };

  public shared ({ caller }) func updateChromaKey(projectId : ProjectId, chromaKey : ChromaKey) : async () {
    let userProjects = getUserProjects(caller);
    let project = fetchProject(userProjects, projectId);
    let updatedProject = {
      project with chromaKey;
    };
    userProjects.add(projectId, updatedProject);
  };

  public shared ({ caller }) func setBackground(projectId : ProjectId, background : ?Storage.ExternalBlob) : async () {
    let userProjects = getUserProjects(caller);
    let project = fetchProject(userProjects, projectId);
    let updatedProject = {
      project with background;
    };
    userProjects.add(projectId, updatedProject);
  };

  public query ({ caller }) func getProject(projectId : ProjectId) : async Project {
    let userProjects = getUserProjects(caller);
    let project = fetchProject(userProjects, projectId);
    project;
  };

  public query ({ caller }) func listProjects() : async [Project] {
    switch (projects.get(caller)) {
      case (null) { [] };
      case (?userProjects) {
        userProjects.values().toArray();
      };
    };
  };

  public shared ({ caller }) func deleteProject(projectId : ProjectId) : async () {
    let userProjects = getUserProjects(caller);
    if (userProjects.containsKey(projectId)) {
      userProjects.remove(projectId);
    } else {
      Runtime.trap("Project does not exist");
    };
  };

  func getUserProjects(user : Principal.Principal) : Map.Map<ProjectId, Project> {
    switch (projects.get(user)) {
      case (null) { Runtime.trap("No projects found for user") };
      case (?userProjects) { userProjects };
    };
  };

  func fetchProject(userProjects : Map.Map<ProjectId, Project>, projectId : ProjectId) : Project {
    switch (userProjects.get(projectId)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) { project };
    };
  };
};
